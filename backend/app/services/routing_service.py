"""Routing service — evaluates routing rules and assigns leads."""
from datetime import datetime, timezone, timedelta
from typing import Optional
from sqlalchemy.orm import Session
from sqlalchemy import func

from app.models.lead import Lead
from app.models.routing_rule import RoutingRule
from app.models.lead_queue import LeadQueue
from app.models.lead_assignment import LeadAssignment
from app.models.assignment_log import AssignmentLog
from app.models.activity_log import ActivityLog
from app.models.tele_group_member import TeleGroupMember
from app.models.customer import Customer


def _utc7_now() -> datetime:
    """Return current time in UTC+7."""
    return datetime.now(timezone.utc) + timedelta(hours=7)


def _time_in_range(time_from: Optional[str], time_to: Optional[str], now: datetime) -> bool:
    """Check if current HH:MM is within [time_from, time_to]."""
    if not time_from or not time_to:
        return True
    current = now.strftime("%H:%M")
    return time_from <= current <= time_to


def _rule_matches(rule: RoutingRule, lead: Lead, customer: Optional[Customer]) -> bool:
    """Return True if all non-null conditions on the rule match the lead (AND logic)."""
    if rule.page_id is not None and lead.page_id != rule.page_id:
        return False
    if rule.service_id is not None and lead.service_id != rule.service_id:
        return False
    if rule.match_source_code is not None:
        # lead.source_id maps to a source; we compare source_code via lead.source
        # For simplicity we check if lead has a source with matching code
        source = getattr(lead, "source", None)
        if source is None or getattr(source, "code", None) != rule.match_source_code:
            return False
    if rule.match_time_from or rule.match_time_to:
        now7 = _utc7_now()
        if not _time_in_range(rule.match_time_from, rule.match_time_to, now7):
            return False
    if rule.match_province is not None:
        if customer is None or getattr(customer, "address", None) is None:
            return False
        # Simple province match: check if province string is in address
        if rule.match_province.lower() not in (customer.address or "").lower():
            return False
    if rule.match_priority is not None and lead.interest_level != rule.match_priority:
        return False
    return True


def _get_round_robin_member(db: Session, group_id: int) -> Optional[int]:
    """Return user_id of active group member with fewest active lead assignments."""
    members = (
        db.query(TeleGroupMember)
        .filter(
            TeleGroupMember.tele_group_id == group_id,
            TeleGroupMember.is_active == True,
        )
        .all()
    )
    if not members:
        return None

    best_user_id = None
    best_count = None
    for m in members:
        count = (
            db.query(func.count(LeadAssignment.id))
            .filter(
                LeadAssignment.assigned_user_id == m.user_id,
                LeadAssignment.is_active == True,
            )
            .scalar()
        ) or 0
        if best_count is None or count < best_count:
            best_count = count
            best_user_id = m.user_id
    return best_user_id


def route_lead(db: Session, lead_id: int, actor_id: int) -> dict:
    """
    Evaluate routing rules and assign lead.
    Returns dict with keys: status (assigned/queued), reason (optional), queue_id (optional).
    """
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.deleted_at.is_(None)).first()
    if not lead:
        return {"status": "error", "reason": "lead_not_found"}

    customer = None
    if lead.customer_id:
        customer = db.query(Customer).filter(Customer.id == lead.customer_id).first()

    # Load active rules ordered by priority desc
    rules = (
        db.query(RoutingRule)
        .filter(RoutingRule.is_active == True)
        .order_by(RoutingRule.priority.desc())
        .all()
    )

    matched_rule = None
    for rule in rules:
        if _rule_matches(rule, lead, customer):
            matched_rule = rule
            break

    if matched_rule is None:
        # No rule matched → push to queue
        queue = LeadQueue(lead_id=lead_id, queue_reason="no_rule", status="pending")
        db.add(queue)
        db.flush()
        db.add(ActivityLog(
            actor_user_id=actor_id,
            action="route_lead_queued",
            target_type="lead",
            target_id=lead_id,
            description="No routing rule matched — pushed to queue",
        ))
        db.commit()
        return {"status": "queued", "reason": "no_rule", "queue_id": queue.id}

    group_id = matched_rule.target_group_id
    assigned_user_id = None

    if matched_rule.assignment_strategy == "round_robin":
        assigned_user_id = _get_round_robin_member(db, group_id)
        if assigned_user_id is None:
            # Group has no active members
            queue = LeadQueue(lead_id=lead_id, queue_reason="no_member", status="pending")
            db.add(queue)
            db.flush()
            db.add(ActivityLog(
                actor_user_id=actor_id,
                action="route_lead_queued",
                target_type="lead",
                target_id=lead_id,
                description=f"Group {group_id} has no active members — pushed to queue",
            ))
            db.commit()
            return {"status": "queued", "reason": "no_member", "queue_id": queue.id}
    else:
        # direct_group — check if group has any active members
        has_members = (
            db.query(TeleGroupMember)
            .filter(
                TeleGroupMember.tele_group_id == group_id,
                TeleGroupMember.is_active == True,
            )
            .first()
        )
        if not has_members:
            queue = LeadQueue(lead_id=lead_id, queue_reason="no_member", status="pending")
            db.add(queue)
            db.flush()
            db.add(ActivityLog(
                actor_user_id=actor_id,
                action="route_lead_queued",
                target_type="lead",
                target_id=lead_id,
                description=f"Group {group_id} has no active members — pushed to queue",
            ))
            db.commit()
            return {"status": "queued", "reason": "no_member", "queue_id": queue.id}

    # Deactivate existing active assignments
    db.query(LeadAssignment).filter(
        LeadAssignment.lead_id == lead_id,
        LeadAssignment.is_active == True,
    ).update({"is_active": False})

    # Create new assignment
    assignment = LeadAssignment(
        lead_id=lead_id,
        assigned_group_id=group_id,
        assigned_user_id=assigned_user_id,
        assignment_type="auto",
        assigned_by=actor_id,
        is_active=True,
    )
    db.add(assignment)

    # Update lead
    old_group = lead.tele_group_id
    old_user = lead.tele_user_id
    lead.tele_group_id = group_id
    if assigned_user_id:
        lead.tele_user_id = assigned_user_id
    if lead.lead_status_code in ("new", "qualified"):
        lead.lead_status_code = "assigned"
    lead.updated_by = actor_id

    # Assignment log
    db.add(AssignmentLog(
        lead_id=lead_id,
        action="auto_route",
        from_group_id=old_group,
        to_group_id=group_id,
        from_user_id=old_user,
        to_user_id=assigned_user_id,
        note=f"Auto-routed by rule '{matched_rule.name}' (id={matched_rule.id})",
    ))

    db.add(ActivityLog(
        actor_user_id=actor_id,
        action="route_lead_assigned",
        target_type="lead",
        target_id=lead_id,
        description=f"Lead routed to group {group_id} via rule '{matched_rule.name}'",
    ))

    db.commit()
    return {
        "status": "assigned",
        "group_id": group_id,
        "user_id": assigned_user_id,
        "rule_id": matched_rule.id,
        "rule_name": matched_rule.name,
    }
