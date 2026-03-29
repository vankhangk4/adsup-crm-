from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel as PydanticBase

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.core.pagination import paginate
from app.core.phone import normalize_phone
from app.models.lead import Lead
from app.models.customer import Customer
from app.models.conversation import Conversation
from app.models.lead_status import LeadStatus
from app.models.activity_log import ActivityLog
from app.models.user import User
from app.services.lead_service import check_duplicate

router = APIRouter(prefix="/leads", tags=["leads"])

VALID_SORT_BY = {"created_at", "updated_at", "lead_status_code"}


class LeadCreate(PydanticBase):
    customer_id: Optional[int] = None
    full_name: Optional[str] = None
    phone: Optional[str] = None
    service_id: int
    source_id: Optional[int] = None
    note_page: Optional[str] = None
    interest_level: Optional[str] = None
    campaign_name: Optional[str] = None
    ad_name: Optional[str] = None


class LeadUpdate(PydanticBase):
    service_id: Optional[int] = None
    source_id: Optional[int] = None
    note_page: Optional[str] = None
    note_tele: Optional[str] = None
    interest_level: Optional[str] = None
    campaign_name: Optional[str] = None
    ad_name: Optional[str] = None


class LeadStatusUpdate(PydanticBase):
    status_code: str


class LeadFromConversationInput(PydanticBase):
    phone: Optional[str] = None
    service_id: int
    source_id: Optional[int] = None
    note_page: Optional[str] = None
    interest_level: Optional[str] = None


def _log_activity(db: Session, actor_id: int, action: str, target_type: str, target_id: int, description: str):
    db.add(ActivityLog(
        actor_user_id=actor_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        description=description,
    ))


def _lead_dict(lead: Lead) -> dict:
    return {
        "id": lead.id,
        "customer_id": lead.customer_id,
        "conversation_id": lead.conversation_id,
        "page_id": lead.page_id,
        "page_user_id": lead.page_user_id,
        "tele_user_id": lead.tele_user_id,
        "tele_group_id": lead.tele_group_id,
        "service_id": lead.service_id,
        "source_id": lead.source_id,
        "campaign_name": lead.campaign_name,
        "ad_name": lead.ad_name,
        "lead_status_code": lead.lead_status_code,
        "interest_level": lead.interest_level,
        "note_page": lead.note_page,
        "note_tele": lead.note_tele,
        "booked_at": lead.booked_at.isoformat() if lead.booked_at else None,
        "visited_at": lead.visited_at.isoformat() if lead.visited_at else None,
        "closed_at": lead.closed_at.isoformat() if lead.closed_at else None,
        "revenue": lead.revenue,
        "is_duplicate": lead.is_duplicate,
        "is_active": lead.is_active,
        "created_at": lead.created_at.isoformat() if lead.created_at else None,
        "updated_at": lead.updated_at.isoformat() if lead.updated_at else None,
    }


def _find_or_create_customer(db: Session, phone: Optional[str], full_name: Optional[str], actor_id: int) -> Customer:
    """Find existing customer by normalized phone or create new one."""
    if phone:
        norm = normalize_phone(phone)
        existing = db.query(Customer).filter(
            Customer.normalized_phone == norm,
            Customer.deleted_at.is_(None),
        ).first()
        if existing:
            return existing

    customer = Customer(
        full_name=full_name or "Unknown",
        phone=phone,
        normalized_phone=normalize_phone(phone) if phone else None,
        created_by=actor_id,
    )
    db.add(customer)
    db.flush()
    return customer


@router.post("", status_code=201)
def create_lead_manual(
    payload: LeadCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Resolve customer
    if payload.customer_id:
        customer = db.query(Customer).filter(
            Customer.id == payload.customer_id,
            Customer.deleted_at.is_(None),
        ).first()
        if not customer:
            raise HTTPException(status_code=422, detail="Customer not found")
    else:
        if not payload.full_name and not payload.phone:
            raise HTTPException(status_code=422, detail="Either customer_id or full_name/phone is required")
        customer = _find_or_create_customer(db, payload.phone, payload.full_name, current_user.id)

    # Duplicate check
    is_dup = check_duplicate(db, customer.id, payload.service_id)

    lead = Lead(
        customer_id=customer.id,
        service_id=payload.service_id,
        source_id=payload.source_id,
        note_page=payload.note_page,
        interest_level=payload.interest_level,
        campaign_name=payload.campaign_name,
        ad_name=payload.ad_name,
        is_duplicate=is_dup,
        created_by=current_user.id,
    )
    db.add(lead)
    db.flush()
    _log_activity(db, current_user.id, "create_lead", "lead", lead.id, f"Lead created for customer {customer.id}")
    db.commit()
    db.refresh(lead)

    response_data = _lead_dict(lead)
    message = "Lead created"
    if is_dup:
        message = "Lead created (duplicate warning: customer already has an active lead for this service)"
    return success_response(data=response_data, message=message)


@router.post("/from-conversation/{conversation_id}", status_code=201)
def create_lead_from_conversation(
    conversation_id: int,
    payload: LeadFromConversationInput,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = db.query(Conversation).filter(
        Conversation.id == conversation_id,
        Conversation.deleted_at.is_(None),
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")

    # Get phone from conversation or input
    phone = payload.phone or conv.collected_phone
    customer_name = conv.customer_name

    customer = _find_or_create_customer(db, phone, customer_name, current_user.id)

    # Duplicate check
    is_dup = check_duplicate(db, customer.id, payload.service_id)

    lead = Lead(
        customer_id=customer.id,
        conversation_id=conversation_id,
        page_id=conv.page_id,
        page_user_id=conv.assigned_page_user_id,
        service_id=payload.service_id,
        source_id=payload.source_id,
        note_page=payload.note_page,
        interest_level=payload.interest_level,
        is_duplicate=is_dup,
        created_by=current_user.id,
    )
    db.add(lead)
    db.flush()

    # Update conversation
    conv.conversation_status = "converted"
    conv.waiting_for_tele = True

    _log_activity(db, current_user.id, "create_lead_from_conversation", "lead", lead.id,
                  f"Lead created from conversation {conversation_id}")
    db.commit()
    db.refresh(lead)

    response_data = _lead_dict(lead)
    message = "Lead created from conversation"
    if is_dup:
        message += " (duplicate warning)"
    return success_response(data=response_data, message=message)


@router.get("")
def list_leads(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    # B078 filters
    service_id: Optional[int] = Query(None),
    page_id: Optional[int] = Query(None),
    page_user_id: Optional[int] = Query(None),
    tele_user_id: Optional[int] = Query(None),
    tele_group_id: Optional[int] = Query(None),
    lead_status_code: Optional[str] = Query(None),
    is_duplicate: Optional[bool] = Query(None),
    created_from: Optional[str] = Query(None),
    created_to: Optional[str] = Query(None),
    keyword: Optional[str] = Query(None),
    # B079 sort
    sort_by: Optional[str] = Query("created_at"),
    sort_order: Optional[str] = Query("desc"),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Lead).filter(Lead.deleted_at.is_(None))

    if service_id is not None:
        query = query.filter(Lead.service_id == service_id)
    if page_id is not None:
        query = query.filter(Lead.page_id == page_id)
    if page_user_id is not None:
        query = query.filter(Lead.page_user_id == page_user_id)
    if tele_user_id is not None:
        query = query.filter(Lead.tele_user_id == tele_user_id)
    if tele_group_id is not None:
        query = query.filter(Lead.tele_group_id == tele_group_id)
    if lead_status_code is not None:
        query = query.filter(Lead.lead_status_code == lead_status_code)
    if is_duplicate is not None:
        query = query.filter(Lead.is_duplicate == is_duplicate)
    if created_from:
        try:
            dt_from = datetime.fromisoformat(created_from)
            query = query.filter(Lead.created_at >= dt_from)
        except ValueError:
            pass
    if created_to:
        try:
            dt_to = datetime.fromisoformat(created_to)
            query = query.filter(Lead.created_at <= dt_to)
        except ValueError:
            pass
    if keyword:
        like = f"%{keyword}%"
        query = query.join(Customer, Lead.customer_id == Customer.id).filter(
            (Customer.full_name.ilike(like)) | (Customer.phone.ilike(like)) | (Customer.normalized_phone.ilike(like))
        )

    # B079 sort
    if sort_by not in VALID_SORT_BY:
        sort_by = "created_at"
    sort_col = getattr(Lead, sort_by)
    if sort_order == "asc":
        query = query.order_by(sort_col.asc())
    else:
        query = query.order_by(sort_col.desc())

    result = paginate(query, page=page, page_size=page_size)
    result["items"] = [_lead_dict(l) for l in result["items"]]
    return success_response(data=result, message="OK")


@router.get("/{lead_id}")
def get_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.deleted_at.is_(None)).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    return success_response(data=_lead_dict(lead), message="OK")


@router.put("/{lead_id}")
def update_lead(
    lead_id: int,
    payload: LeadUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.deleted_at.is_(None)).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    if payload.service_id is not None:
        lead.service_id = payload.service_id
    if payload.source_id is not None:
        lead.source_id = payload.source_id
    if payload.note_page is not None:
        lead.note_page = payload.note_page
    if payload.note_tele is not None:
        lead.note_tele = payload.note_tele
    if payload.interest_level is not None:
        lead.interest_level = payload.interest_level
    if payload.campaign_name is not None:
        lead.campaign_name = payload.campaign_name
    if payload.ad_name is not None:
        lead.ad_name = payload.ad_name
    lead.updated_by = current_user.id

    db.commit()
    db.refresh(lead)
    return success_response(data=_lead_dict(lead), message="Lead updated")


@router.patch("/{lead_id}/status")
def update_lead_status(
    lead_id: int,
    payload: LeadStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Validate status code
    valid_status = db.query(LeadStatus).filter(
        LeadStatus.code == payload.status_code,
        LeadStatus.is_active == True,
    ).first()
    if not valid_status:
        raise HTTPException(status_code=422, detail=f"Invalid status code: {payload.status_code}")

    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.deleted_at.is_(None)).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    old_status = lead.lead_status_code
    lead.lead_status_code = payload.status_code
    lead.updated_by = current_user.id

    _log_activity(db, current_user.id, "update_lead_status", "lead", lead_id,
                  f"Status changed from {old_status} to {payload.status_code}")
    db.commit()
    db.refresh(lead)
    return success_response(data=_lead_dict(lead), message="Lead status updated")


# ── B089 / B090 — Assignment endpoints ──────────────────────────────────────

class AssignUserRequest(PydanticBase):
    user_id: int


class AssignGroupRequest(PydanticBase):
    group_id: int


@router.post("/{lead_id}/assign-user")
def assign_lead_to_user(
    lead_id: int,
    payload: AssignUserRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.lead_assignment import LeadAssignment
    from app.models.assignment_log import AssignmentLog

    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.deleted_at.is_(None)).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    old_user_id = lead.tele_user_id

    # Deactivate existing active assignments
    db.query(LeadAssignment).filter(
        LeadAssignment.lead_id == lead_id,
        LeadAssignment.is_active == True,
    ).update({"is_active": False})

    # Create new assignment
    assignment = LeadAssignment(
        lead_id=lead_id,
        assigned_user_id=payload.user_id,
        assignment_type="manual",
        assigned_by=current_user.id,
        is_active=True,
    )
    db.add(assignment)

    # Update lead
    lead.tele_user_id = payload.user_id
    lead.updated_by = current_user.id

    # Auto-advance status if new/qualified
    if lead.lead_status_code in ("new", "qualified"):
        lead.lead_status_code = "assigned"

    # Log
    db.add(AssignmentLog(
        lead_id=lead_id,
        action="assign_user",
        from_user_id=old_user_id,
        to_user_id=payload.user_id,
        note=f"Assigned by user {current_user.id}",
    ))
    _log_activity(db, current_user.id, "assign_lead_user", "lead", lead_id,
                  f"Lead assigned to user {payload.user_id}")
    db.commit()
    db.refresh(lead)
    return success_response(data=_lead_dict(lead), message="Lead assigned to user")


@router.post("/{lead_id}/route")
def route_lead_endpoint(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.services.routing_service import route_lead
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.deleted_at.is_(None)).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    result = route_lead(db, lead_id, current_user.id)
    if result.get("status") == "error":
        raise HTTPException(status_code=404, detail=result.get("reason", "error"))
    return success_response(data=result, message="Lead routed")


@router.post("/{lead_id}/assign-group")
def assign_lead_to_group(
    lead_id: int,
    payload: AssignGroupRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.lead_assignment import LeadAssignment
    from app.models.assignment_log import AssignmentLog

    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.deleted_at.is_(None)).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")

    old_group_id = lead.tele_group_id

    # Create assignment record
    assignment = LeadAssignment(
        lead_id=lead_id,
        assigned_group_id=payload.group_id,
        assignment_type="manual",
        assigned_by=current_user.id,
        is_active=True,
    )
    db.add(assignment)

    lead.tele_group_id = payload.group_id
    lead.updated_by = current_user.id

    db.add(AssignmentLog(
        lead_id=lead_id,
        action="assign_group",
        from_group_id=old_group_id,
        to_group_id=payload.group_id,
        note=f"Assigned by user {current_user.id}",
    ))
    _log_activity(db, current_user.id, "assign_lead_group", "lead", lead_id,
                  f"Lead assigned to group {payload.group_id}")
    db.commit()
    db.refresh(lead)
    return success_response(data=_lead_dict(lead), message="Lead assigned to group")
