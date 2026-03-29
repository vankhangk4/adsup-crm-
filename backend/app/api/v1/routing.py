"""Routing rules and lead queue endpoints (B106–B109)."""
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel as PydanticBase

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_permission
from app.core.response import success_response
from app.core.pagination import paginate
from app.models.routing_rule import RoutingRule
from app.models.lead_queue import LeadQueue
from app.models.user import User

router = APIRouter(tags=["routing"])


# ── Schemas ──────────────────────────────────────────────────────────────────

class RoutingRuleCreate(PydanticBase):
    name: str
    priority: int = 0
    page_id: Optional[int] = None
    service_id: Optional[int] = None
    target_group_id: Optional[int] = None
    assignment_strategy: str = "direct_group"
    match_source_code: Optional[str] = None
    match_time_from: Optional[str] = None
    match_time_to: Optional[str] = None
    match_province: Optional[str] = None
    match_priority: Optional[str] = None


class RoutingRuleUpdate(PydanticBase):
    name: Optional[str] = None
    priority: Optional[int] = None
    page_id: Optional[int] = None
    service_id: Optional[int] = None
    target_group_id: Optional[int] = None
    assignment_strategy: Optional[str] = None
    match_source_code: Optional[str] = None
    match_time_from: Optional[str] = None
    match_time_to: Optional[str] = None
    match_province: Optional[str] = None
    match_priority: Optional[str] = None


class QueueReleaseRequest(PydanticBase):
    user_id: Optional[int] = None
    group_id: Optional[int] = None


def _rule_dict(rule: RoutingRule) -> dict:
    return {
        "id": rule.id,
        "name": rule.name,
        "priority": rule.priority,
        "page_id": rule.page_id,
        "service_id": rule.service_id,
        "target_group_id": rule.target_group_id,
        "assignment_strategy": rule.assignment_strategy,
        "match_source_code": rule.match_source_code,
        "match_time_from": rule.match_time_from,
        "match_time_to": rule.match_time_to,
        "match_province": rule.match_province,
        "match_priority": rule.match_priority,
        "is_active": rule.is_active,
        "created_at": rule.created_at.isoformat() if rule.created_at else None,
        "updated_at": rule.updated_at.isoformat() if rule.updated_at else None,
    }


def _queue_dict(q: LeadQueue) -> dict:
    return {
        "id": q.id,
        "lead_id": q.lead_id,
        "queue_reason": q.queue_reason,
        "status": q.status,
        "created_at": q.created_at.isoformat() if q.created_at else None,
        "released_at": q.released_at.isoformat() if q.released_at else None,
        "released_by": q.released_by,
    }


# ── B106: Routing Rules CRUD ─────────────────────────────────────────────────

@router.post("/routing-rules", status_code=201)
def create_routing_rule(
    payload: RoutingRuleCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("routing.manage")),
):
    rule = RoutingRule(
        name=payload.name,
        priority=payload.priority,
        page_id=payload.page_id,
        service_id=payload.service_id,
        target_group_id=payload.target_group_id,
        assignment_strategy=payload.assignment_strategy,
        match_source_code=payload.match_source_code,
        match_time_from=payload.match_time_from,
        match_time_to=payload.match_time_to,
        match_province=payload.match_province,
        match_priority=payload.match_priority,
        created_by=current_user.id,
    )
    db.add(rule)
    db.commit()
    db.refresh(rule)
    return success_response(data=_rule_dict(rule), message="Routing rule created")


@router.get("/routing-rules")
def list_routing_rules(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(RoutingRule)
    if is_active is not None:
        query = query.filter(RoutingRule.is_active == is_active)
    query = query.order_by(RoutingRule.priority.desc())
    result = paginate(query, page=page, page_size=page_size)
    result["items"] = [_rule_dict(r) for r in result["items"]]
    return success_response(data=result, message="OK")


@router.put("/routing-rules/{rule_id}")
def update_routing_rule(
    rule_id: int,
    payload: RoutingRuleUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("routing.manage")),
):
    rule = db.query(RoutingRule).filter(RoutingRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Routing rule not found")

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(rule, field, value)
    rule.updated_by = current_user.id
    db.commit()
    db.refresh(rule)
    return success_response(data=_rule_dict(rule), message="Routing rule updated")


@router.patch("/routing-rules/{rule_id}/status")
def toggle_routing_rule_status(
    rule_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("routing.manage")),
):
    rule = db.query(RoutingRule).filter(RoutingRule.id == rule_id).first()
    if not rule:
        raise HTTPException(status_code=404, detail="Routing rule not found")
    rule.is_active = not rule.is_active
    rule.updated_by = current_user.id
    db.commit()
    db.refresh(rule)
    return success_response(data=_rule_dict(rule), message="Status toggled")


# ── B108: Lead Queue list ────────────────────────────────────────────────────

@router.get("/lead-queues")
def list_lead_queues(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    status: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(LeadQueue)
    if status:
        query = query.filter(LeadQueue.status == status)
    query = query.order_by(LeadQueue.created_at.desc())
    result = paginate(query, page=page, page_size=page_size)
    result["items"] = [_queue_dict(q) for q in result["items"]]
    return success_response(data=result, message="OK")


# ── B109: Release lead from queue ────────────────────────────────────────────

@router.post("/lead-queues/{queue_id}/release")
def release_lead_queue(
    queue_id: int,
    payload: QueueReleaseRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.lead import Lead
    from app.models.lead_assignment import LeadAssignment
    from app.models.assignment_log import AssignmentLog
    from app.models.activity_log import ActivityLog

    queue = db.query(LeadQueue).filter(LeadQueue.id == queue_id).first()
    if not queue:
        raise HTTPException(status_code=404, detail="Queue entry not found")
    if queue.status != "pending":
        raise HTTPException(status_code=422, detail=f"Queue is already {queue.status}")

    if not payload.user_id and not payload.group_id:
        raise HTTPException(status_code=422, detail="Either user_id or group_id is required")

    lead = db.query(Lead).filter(Lead.id == queue.lead_id, Lead.deleted_at.is_(None)).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    # Deactivate existing active assignments
    db.query(LeadAssignment).filter(
        LeadAssignment.lead_id == lead.id,
        LeadAssignment.is_active == True,
    ).update({"is_active": False})

    # Create new assignment
    assignment = LeadAssignment(
        lead_id=lead.id,
        assigned_user_id=payload.user_id,
        assigned_group_id=payload.group_id,
        assignment_type="queue_release",
        assigned_by=current_user.id,
        is_active=True,
    )
    db.add(assignment)

    # Update lead
    if payload.user_id:
        lead.tele_user_id = payload.user_id
    if payload.group_id:
        lead.tele_group_id = payload.group_id
    if lead.lead_status_code in ("new", "qualified"):
        lead.lead_status_code = "assigned"
    lead.updated_by = current_user.id

    # Update queue
    queue.status = "released"
    queue.released_at = datetime.now(timezone.utc)
    queue.released_by = current_user.id

    db.add(AssignmentLog(
        lead_id=lead.id,
        action="queue_release",
        to_user_id=payload.user_id,
        to_group_id=payload.group_id,
        note=f"Released from queue by user {current_user.id}",
    ))
    db.add(ActivityLog(
        actor_user_id=current_user.id,
        action="release_queue",
        target_type="lead_queue",
        target_id=queue_id,
        description=f"Queue {queue_id} released, lead {lead.id} assigned",
    ))
    db.commit()
    db.refresh(queue)
    return success_response(data=_queue_dict(queue), message="Queue released and lead assigned")
