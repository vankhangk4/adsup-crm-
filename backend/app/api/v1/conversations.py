from datetime import datetime, timezone
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel as PydanticBase

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.core.pagination import paginate
from app.models.conversation import Conversation
from app.models.message import Message
from app.models.conversation_tag import ConversationTag
from app.models.conversation_assignment import ConversationAssignment
from app.models.page import Page
from app.models.page_user_assignment import PageUserAssignment
from app.models.activity_log import ActivityLog
from app.models.user import User
from app.models.permission import Permission
from app.models.role_permission import RolePermission
from app.models.user_role import UserRole

router = APIRouter(prefix="/conversations", tags=["conversations"])

VALID_STATUSES = {"open", "pending", "resolved", "converted", "archived"}


class ConversationCreate(PydanticBase):
    page_id: int
    page_account_id: Optional[int] = None
    external_customer_id: Optional[str] = None
    customer_name: Optional[str] = None
    customer_avatar: Optional[str] = None


class ConversationUpdate(PydanticBase):
    customer_name: Optional[str] = None
    internal_note: Optional[str] = None


class MessageCreate(PydanticBase):
    message_text: str
    sender_type: str = "page_staff"  # customer/page_staff/system
    message_type: str = "text"


class AssignRequest(PydanticBase):
    user_id: int


class TagsRequest(PydanticBase):
    tag_names: List[str]


class StatusUpdate(PydanticBase):
    status: str


class MarkHotRequest(PydanticBase):
    is_hot: bool


class MarkPhoneRequest(PydanticBase):
    phone: str


class InternalNoteUpdate(PydanticBase):
    note: str


def _conv_dict(c: Conversation) -> dict:
    return {
        "id": c.id,
        "page_id": c.page_id,
        "page_account_id": c.page_account_id,
        "external_customer_id": c.external_customer_id,
        "customer_name": c.customer_name,
        "customer_avatar": c.customer_avatar,
        "assigned_page_user_id": c.assigned_page_user_id,
        "conversation_status": c.conversation_status,
        "last_message": c.last_message,
        "last_message_time": c.last_message_time.isoformat() if c.last_message_time else None,
        "is_hot": c.is_hot,
        "phone_collected": c.phone_collected,
        "collected_phone": c.collected_phone,
        "waiting_for_tele": c.waiting_for_tele,
        "internal_note": c.internal_note,
        "is_active": c.is_active,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


def _msg_dict(m: Message) -> dict:
    return {
        "id": m.id,
        "conversation_id": m.conversation_id,
        "sender_type": m.sender_type,
        "sender_user_id": m.sender_user_id,
        "message_text": m.message_text,
        "message_type": m.message_type,
        "sent_at": m.sent_at.isoformat() if m.sent_at else None,
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


def _get_conversation(db: Session, conv_id: int) -> Conversation:
    conv = db.query(Conversation).filter(
        Conversation.id == conv_id,
        Conversation.deleted_at.is_(None),
    ).first()
    if not conv:
        raise HTTPException(status_code=404, detail="Conversation not found")
    return conv


@router.post("", status_code=201)
def create_conversation(
    payload: ConversationCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not db.query(Page).filter(Page.id == payload.page_id).first():
        raise HTTPException(status_code=422, detail="Page not found")
    conv = Conversation(
        page_id=payload.page_id,
        page_account_id=payload.page_account_id,
        external_customer_id=payload.external_customer_id,
        customer_name=payload.customer_name,
        customer_avatar=payload.customer_avatar,
        conversation_status="open",
    )
    db.add(conv)
    db.commit()
    db.refresh(conv)
    return success_response(data=_conv_dict(conv), message="Conversation created")


@router.get("")
def list_conversations(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    page_id: Optional[int] = Query(None),
    status: Optional[str] = Query(None),
    assigned_user_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Conversation).filter(Conversation.deleted_at.is_(None))

    # B063: scope
    if not _has_permission(db, current_user.id, "page.manage"):
        assigned_page_ids = (
            db.query(PageUserAssignment.page_id)
            .filter(
                PageUserAssignment.user_id == current_user.id,
                PageUserAssignment.is_active == True,
            )
            .subquery()
        )
        query = query.filter(Conversation.page_id.in_(assigned_page_ids))

    if page_id is not None:
        query = query.filter(Conversation.page_id == page_id)
    if status is not None:
        query = query.filter(Conversation.conversation_status == status)
    if assigned_user_id is not None:
        query = query.filter(Conversation.assigned_page_user_id == assigned_user_id)

    result = paginate(query, page=page, page_size=page_size)
    result["items"] = [_conv_dict(c) for c in result["items"]]
    return success_response(data=result, message="OK")


@router.get("/{conv_id}")
def get_conversation(
    conv_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    conv = _get_conversation(db, conv_id)
    return success_response(data=_conv_dict(conv), message="OK")


@router.patch("/{conv_id}")
def update_conversation(
    conv_id: int,
    payload: ConversationUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    conv = _get_conversation(db, conv_id)
    if payload.customer_name is not None:
        conv.customer_name = payload.customer_name
    if payload.internal_note is not None:
        conv.internal_note = payload.internal_note
    db.commit()
    db.refresh(conv)
    return success_response(data=_conv_dict(conv), message="Conversation updated")


@router.post("/{conv_id}/messages", status_code=201)
def create_message(
    conv_id: int,
    payload: MessageCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = _get_conversation(db, conv_id)
    now = datetime.now(timezone.utc)
    msg = Message(
        conversation_id=conv_id,
        sender_type=payload.sender_type,
        sender_user_id=current_user.id if payload.sender_type == "page_staff" else None,
        message_text=payload.message_text,
        message_type=payload.message_type,
        sent_at=now,
    )
    db.add(msg)
    # Atomically update last_message + last_message_time
    conv.last_message = payload.message_text
    conv.last_message_time = now
    db.commit()
    db.refresh(msg)
    return success_response(data=_msg_dict(msg), message="Message created")


@router.get("/{conv_id}/messages")
def list_messages(
    conv_id: int,
    page: int = Query(1, ge=1),
    page_size: int = Query(50, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    _get_conversation(db, conv_id)
    query = db.query(Message).filter(Message.conversation_id == conv_id).order_by(Message.sent_at.asc())
    result = paginate(query, page=page, page_size=page_size)
    result["items"] = [_msg_dict(m) for m in result["items"]]
    return success_response(data=result, message="OK")


@router.post("/{conv_id}/assign")
def assign_conversation(
    conv_id: int,
    payload: AssignRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = _get_conversation(db, conv_id)
    # Deactivate existing active assignments
    db.query(ConversationAssignment).filter(
        ConversationAssignment.conversation_id == conv_id,
        ConversationAssignment.is_active == True,
    ).update({"is_active": False})
    # Create new assignment
    assignment = ConversationAssignment(
        conversation_id=conv_id,
        assigned_user_id=payload.user_id,
        assigned_by=current_user.id,
    )
    db.add(assignment)
    conv.assigned_page_user_id = payload.user_id
    _log_activity(db, current_user.id, "assign_conversation", "conversation", conv_id,
                  f"Assigned conversation {conv_id} to user {payload.user_id}")
    db.commit()
    return success_response(message="Conversation assigned")


@router.post("/{conv_id}/tags")
def add_tags(
    conv_id: int,
    payload: TagsRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    _get_conversation(db, conv_id)
    for tag_name in payload.tag_names:
        db.add(ConversationTag(conversation_id=conv_id, tag_name=tag_name))
    db.commit()
    return success_response(message="Tags added")


@router.patch("/{conv_id}/status")
def update_status(
    conv_id: int,
    payload: StatusUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if payload.status not in VALID_STATUSES:
        raise HTTPException(status_code=422, detail=f"Invalid status. Must be one of: {', '.join(VALID_STATUSES)}")
    conv = _get_conversation(db, conv_id)
    conv.conversation_status = payload.status
    _log_activity(db, current_user.id, "update_conversation_status", "conversation", conv_id,
                  f"Status changed to {payload.status}")
    db.commit()
    db.refresh(conv)
    return success_response(data=_conv_dict(conv), message="Status updated")


@router.post("/{conv_id}/mark-hot")
def mark_hot(
    conv_id: int,
    payload: MarkHotRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = _get_conversation(db, conv_id)
    conv.is_hot = payload.is_hot
    _log_activity(db, current_user.id, "mark_hot", "conversation", conv_id,
                  f"is_hot set to {payload.is_hot}")
    db.commit()
    db.refresh(conv)
    return success_response(data=_conv_dict(conv), message="Marked hot")


@router.post("/{conv_id}/mark-phone-collected")
def mark_phone_collected(
    conv_id: int,
    payload: MarkPhoneRequest,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = _get_conversation(db, conv_id)
    conv.phone_collected = True
    conv.collected_phone = payload.phone
    _log_activity(db, current_user.id, "mark_phone_collected", "conversation", conv_id,
                  f"Phone collected: {payload.phone}")
    db.commit()
    db.refresh(conv)
    return success_response(data=_conv_dict(conv), message="Phone collected")


@router.post("/{conv_id}/mark-waiting-tele")
def mark_waiting_tele(
    conv_id: int,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    conv = _get_conversation(db, conv_id)
    conv.waiting_for_tele = True
    _log_activity(db, current_user.id, "mark_waiting_tele", "conversation", conv_id,
                  "Marked waiting for tele")
    db.commit()
    db.refresh(conv)
    return success_response(data=_conv_dict(conv), message="Marked waiting for tele")


@router.patch("/{conv_id}/internal-note")
def update_internal_note(
    conv_id: int,
    payload: InternalNoteUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    conv = _get_conversation(db, conv_id)
    conv.internal_note = payload.note
    db.commit()
    db.refresh(conv)
    return success_response(data=_conv_dict(conv), message="Internal note updated")
