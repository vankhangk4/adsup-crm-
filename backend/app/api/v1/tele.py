from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel as PydanticBase

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.core.pagination import paginate
from app.models.lead import Lead
from app.models.call_log import CallLog
from app.models.tele_note import TeleNote
from app.models.follow_up_task import FollowUpTask
from app.models.appointment import Appointment
from app.models.tele_status_log import TeleStatusLog
from app.models.tele_group_member import TeleGroupMember
from app.models.activity_log import ActivityLog
from app.models.permission import Permission
from app.models.role_permission import RolePermission
from app.models.user_role import UserRole
from app.models.user import User

router = APIRouter(prefix="/tele", tags=["tele"])

# Status → datetime field mapping
STATUS_DATETIME_MAP = {
    "booked": "booked_at",
    "visited": "visited_at",
    "won": "closed_at",
    "lost": "closed_at",
}


def _has_permission(db: Session, user_id: int, code: str) -> bool:
    return bool(
        db.query(Permission)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .join(UserRole, UserRole.role_id == RolePermission.role_id)
        .filter(UserRole.user_id == user_id, Permission.code == code)
        .first()
    )


def _log_activity(db: Session, actor_id: int, action: str, target_type: str, target_id: int, description: str):
    db.add(ActivityLog(
        actor_user_id=actor_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        description=description,
    ))


def _get_lead_for_tele(db: Session, lead_id: int, current_user: User) -> Lead:
    """Get lead, enforce tele ownership or follow_up permission."""
    lead = db.query(Lead).filter(Lead.id == lead_id, Lead.deleted_at.is_(None)).first()
    if not lead:
        raise HTTPException(status_code=404, detail="Lead not found")
    if lead.tele_user_id != current_user.id and not _has_permission(db, current_user.id, "tele.follow_up"):
        raise HTTPException(status_code=403, detail="Access denied: not your lead")
    return lead


def _lead_dict(lead: Lead) -> dict:
    return {
        "id": lead.id,
        "customer_id": lead.customer_id,
        "tele_user_id": lead.tele_user_id,
        "tele_group_id": lead.tele_group_id,
        "service_id": lead.service_id,
        "lead_status_code": lead.lead_status_code,
        "interest_level": lead.interest_level,
        "note_page": lead.note_page,
        "note_tele": lead.note_tele,
        "booked_at": lead.booked_at.isoformat() if lead.booked_at else None,
        "visited_at": lead.visited_at.isoformat() if lead.visited_at else None,
        "closed_at": lead.closed_at.isoformat() if lead.closed_at else None,
        "is_duplicate": lead.is_duplicate,
        "created_at": lead.created_at.isoformat() if lead.created_at else None,
    }


# ── B091 — List tele leads ───────────────────────────────────────────────────

@router.get("/leads")
def list_tele_leads(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    lead_status_code: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Lead).filter(
        Lead.tele_user_id == current_user.id,
        Lead.deleted_at.is_(None),
    )
    if lead_status_code:
        query = query.filter(Lead.lead_status_code == lead_status_code)
    query = query.order_by(Lead.created_at.desc())
    result = paginate(query, page=page, page_size=page_size)
    result["items"] = [_lead_dict(l) for l in result["items"]]
    return success_response(data=result, message="OK")


# ── B092 — Get tele lead detail ──────────────────────────────────────────────

@router.get("/leads/{lead_id}")
def get_tele_lead(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lead = _get_lead_for_tele(db, lead_id, current_user)
    return success_response(data=_lead_dict(lead), message="OK")


# ── B098 — Call logs ─────────────────────────────────────────────────────────

class CallLogCreate(PydanticBase):
    call_status: str  # success/failed/no_answer/busy
    call_result: Optional[str] = None
    note: Optional[str] = None
    called_at: Optional[str] = None


@router.post("/leads/{lead_id}/call-logs", status_code=201)
def add_call_log(
    lead_id: int,
    payload: CallLogCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_lead_for_tele(db, lead_id, current_user)

    called_at = datetime.now(timezone.utc)
    if payload.called_at:
        try:
            called_at = datetime.fromisoformat(payload.called_at)
        except ValueError:
            pass

    log = CallLog(
        lead_id=lead_id,
        tele_user_id=current_user.id,
        call_status=payload.call_status,
        call_result=payload.call_result,
        note=payload.note,
        called_at=called_at,
    )
    db.add(log)
    db.commit()
    db.refresh(log)
    return success_response(data={
        "id": log.id,
        "lead_id": log.lead_id,
        "call_status": log.call_status,
        "call_result": log.call_result,
        "note": log.note,
        "called_at": log.called_at.isoformat(),
    }, message="Call log added")


@router.get("/leads/{lead_id}/call-logs")
def list_call_logs(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_lead_for_tele(db, lead_id, current_user)
    logs = db.query(CallLog).filter(CallLog.lead_id == lead_id).order_by(CallLog.called_at.desc()).all()
    return success_response(data=[{
        "id": l.id,
        "call_status": l.call_status,
        "call_result": l.call_result,
        "note": l.note,
        "called_at": l.called_at.isoformat(),
    } for l in logs], message="OK")


# ── B099 — Tele notes ────────────────────────────────────────────────────────

class TeleNoteCreate(PydanticBase):
    note: str


@router.post("/leads/{lead_id}/notes", status_code=201)
def add_tele_note(
    lead_id: int,
    payload: TeleNoteCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_lead_for_tele(db, lead_id, current_user)
    note = TeleNote(lead_id=lead_id, tele_user_id=current_user.id, note=payload.note)
    db.add(note)
    db.commit()
    db.refresh(note)
    return success_response(data={
        "id": note.id,
        "lead_id": note.lead_id,
        "note": note.note,
        "created_at": note.created_at.isoformat(),
    }, message="Note added")


@router.get("/leads/{lead_id}/notes")
def list_tele_notes(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_lead_for_tele(db, lead_id, current_user)
    notes = db.query(TeleNote).filter(TeleNote.lead_id == lead_id).order_by(TeleNote.created_at.desc()).all()
    return success_response(data=[{
        "id": n.id,
        "note": n.note,
        "tele_user_id": n.tele_user_id,
        "created_at": n.created_at.isoformat(),
    } for n in notes], message="OK")


# ── B100 — Follow-up tasks ───────────────────────────────────────────────────

class FollowUpCreate(PydanticBase):
    due_at: str
    note: Optional[str] = None


@router.post("/leads/{lead_id}/follow-ups", status_code=201)
def create_follow_up(
    lead_id: int,
    payload: FollowUpCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_lead_for_tele(db, lead_id, current_user)
    try:
        due_at = datetime.fromisoformat(payload.due_at)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid due_at format")

    task = FollowUpTask(
        lead_id=lead_id,
        tele_user_id=current_user.id,
        due_at=due_at,
        note=payload.note,
    )
    db.add(task)
    db.commit()
    db.refresh(task)
    return success_response(data={
        "id": task.id,
        "lead_id": task.lead_id,
        "due_at": task.due_at.isoformat(),
        "status": task.status,
        "note": task.note,
    }, message="Follow-up task created")


@router.get("/leads/{lead_id}/follow-ups")
def list_follow_ups(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_lead_for_tele(db, lead_id, current_user)
    tasks = db.query(FollowUpTask).filter(FollowUpTask.lead_id == lead_id).order_by(FollowUpTask.due_at.asc()).all()
    return success_response(data=[{
        "id": t.id,
        "due_at": t.due_at.isoformat(),
        "status": t.status,
        "note": t.note,
    } for t in tasks], message="OK")


# ── B101 — Appointments ──────────────────────────────────────────────────────

class AppointmentCreate(PydanticBase):
    appointment_at: str
    appointment_branch: Optional[str] = None
    note: Optional[str] = None


@router.post("/leads/{lead_id}/appointments", status_code=201)
def create_appointment(
    lead_id: int,
    payload: AppointmentCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    lead = _get_lead_for_tele(db, lead_id, current_user)
    try:
        appt_at = datetime.fromisoformat(payload.appointment_at)
    except ValueError:
        raise HTTPException(status_code=422, detail="Invalid appointment_at format")

    appt = Appointment(
        lead_id=lead_id,
        tele_user_id=current_user.id,
        appointment_at=appt_at,
        appointment_branch=payload.appointment_branch,
        note=payload.note,
    )
    db.add(appt)

    # Update lead.booked_at if status is scheduled
    if not lead.booked_at:
        lead.booked_at = appt_at

    db.commit()
    db.refresh(appt)
    return success_response(data={
        "id": appt.id,
        "lead_id": appt.lead_id,
        "appointment_at": appt.appointment_at.isoformat(),
        "appointment_branch": appt.appointment_branch,
        "status": appt.status,
        "note": appt.note,
    }, message="Appointment created")


@router.get("/leads/{lead_id}/appointments")
def list_appointments(
    lead_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    _get_lead_for_tele(db, lead_id, current_user)
    appts = db.query(Appointment).filter(Appointment.lead_id == lead_id).order_by(Appointment.appointment_at.asc()).all()
    return success_response(data=[{
        "id": a.id,
        "appointment_at": a.appointment_at.isoformat(),
        "appointment_branch": a.appointment_branch,
        "status": a.status,
        "note": a.note,
    } for a in appts], message="OK")


# ── B102 — Tele update lead status ──────────────────────────────────────────

class TeleStatusUpdate(PydanticBase):
    status_code: str


@router.patch("/leads/{lead_id}/status")
def tele_update_lead_status(
    lead_id: int,
    payload: TeleStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    from app.models.lead_status import LeadStatus

    valid_status = db.query(LeadStatus).filter(
        LeadStatus.code == payload.status_code,
        LeadStatus.is_active == True,
    ).first()
    if not valid_status:
        raise HTTPException(status_code=422, detail=f"Invalid status code: {payload.status_code}")

    lead = _get_lead_for_tele(db, lead_id, current_user)
    old_status = lead.lead_status_code

    # Create status log
    db.add(TeleStatusLog(
        lead_id=lead_id,
        tele_user_id=current_user.id,
        from_status=old_status,
        to_status=payload.status_code,
    ))

    lead.lead_status_code = payload.status_code
    now = datetime.now(timezone.utc)

    # Sync datetime fields
    if payload.status_code == "booked" and not lead.booked_at:
        lead.booked_at = now
    elif payload.status_code == "visited" and not lead.visited_at:
        lead.visited_at = now
    elif payload.status_code in ("won", "lost") and not lead.closed_at:
        lead.closed_at = now

    lead.updated_by = current_user.id
    db.commit()
    db.refresh(lead)
    return success_response(data=_lead_dict(lead), message="Lead status updated")


# ── B103 — Tele group leads ──────────────────────────────────────────────────

@router.get("/group/leads")
def list_group_leads(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    lead_status_code: Optional[str] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # Get groups where current user is an active member
    group_ids = (
        db.query(TeleGroupMember.tele_group_id)
        .filter(
            TeleGroupMember.user_id == current_user.id,
            TeleGroupMember.is_active == True,
        )
        .subquery()
    )

    query = db.query(Lead).filter(
        Lead.tele_group_id.in_(group_ids),
        Lead.deleted_at.is_(None),
    )
    if lead_status_code:
        query = query.filter(Lead.lead_status_code == lead_status_code)
    query = query.order_by(Lead.created_at.desc())

    result = paginate(query, page=page, page_size=page_size)
    result["items"] = [_lead_dict(l) for l in result["items"]]
    return success_response(data=result, message="OK")


# ── Follow-up status patch ───────────────────────────────────────────────────

class FollowUpStatusUpdate(PydanticBase):
    status: str  # pending/done/cancelled


class AppointmentStatusUpdate(PydanticBase):
    status: str  # scheduled/visited/cancelled/no_show


# These are at /follow-ups/{id}/status and /appointments/{id}/status
# They are registered on a separate router below to avoid prefix conflict
followup_router = APIRouter(tags=["tele"])
appointment_router = APIRouter(tags=["tele"])


@followup_router.patch("/follow-ups/{task_id}/status")
def update_followup_status(
    task_id: int,
    payload: FollowUpStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    task = db.query(FollowUpTask).filter(FollowUpTask.id == task_id).first()
    if not task:
        raise HTTPException(status_code=404, detail="Follow-up task not found")
    task.status = payload.status
    db.commit()
    return success_response(message="Follow-up status updated")


@appointment_router.patch("/appointments/{appt_id}/status")
def update_appointment_status(
    appt_id: int,
    payload: AppointmentStatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    appt = db.query(Appointment).filter(Appointment.id == appt_id).first()
    if not appt:
        raise HTTPException(status_code=404, detail="Appointment not found")
    appt.status = payload.status
    db.commit()
    return success_response(message="Appointment status updated")
