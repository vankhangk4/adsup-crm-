from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel as PydanticBase

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.core.pagination import paginate
from app.models.tele_group import TeleGroup
from app.models.tele_group_member import TeleGroupMember
from app.models.tele_group_service_permission import TeleGroupServicePermission
from app.models.lead_assignment import LeadAssignment
from app.models.user import User

router = APIRouter(prefix="/tele-groups", tags=["tele-groups"])


class TeleGroupCreate(PydanticBase):
    name: str
    code: str
    description: Optional[str] = None
    max_capacity: int = 20


class TeleGroupUpdate(PydanticBase):
    name: Optional[str] = None
    description: Optional[str] = None
    max_capacity: Optional[int] = None


class AddMemberRequest(PydanticBase):
    user_id: int


class AddServicesRequest(PydanticBase):
    service_ids: List[int]


def _group_dict(group: TeleGroup, current_load: int = 0) -> dict:
    usage_percent = round((current_load / group.max_capacity) * 100, 1) if group.max_capacity > 0 else 0
    return {
        "id": group.id,
        "name": group.name,
        "code": group.code,
        "description": group.description,
        "max_capacity": group.max_capacity,
        "is_active": group.is_active,
        "current_load": current_load,
        "usage_percent": usage_percent,
        "created_at": group.created_at.isoformat() if group.created_at else None,
    }


@router.post("", status_code=201)
def create_tele_group(
    payload: TeleGroupCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    existing = db.query(TeleGroup).filter(TeleGroup.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=422, detail="Tele group code already exists")

    group = TeleGroup(
        name=payload.name,
        code=payload.code,
        description=payload.description,
        max_capacity=payload.max_capacity,
        created_by=current_user.id,
    )
    db.add(group)
    db.commit()
    db.refresh(group)
    return success_response(data=_group_dict(group), message="Tele group created")


@router.get("")
def list_tele_groups(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(TeleGroup).filter(TeleGroup.is_active == True)
    result = paginate(query, page=page, page_size=page_size)

    items = []
    for group in result["items"]:
        current_load = (
            db.query(LeadAssignment)
            .filter(
                LeadAssignment.assigned_group_id == group.id,
                LeadAssignment.is_active == True,
            )
            .count()
        )
        items.append(_group_dict(group, current_load))
    result["items"] = items
    return success_response(data=result, message="OK")


@router.put("/{group_id}")
def update_tele_group(
    group_id: int,
    payload: TeleGroupUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    group = db.query(TeleGroup).filter(TeleGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Tele group not found")

    if payload.name is not None:
        group.name = payload.name
    if payload.description is not None:
        group.description = payload.description
    if payload.max_capacity is not None:
        group.max_capacity = payload.max_capacity
    group.updated_by = current_user.id

    db.commit()
    db.refresh(group)
    return success_response(data=_group_dict(group), message="Tele group updated")


@router.post("/{group_id}/members", status_code=201)
def add_member(
    group_id: int,
    payload: AddMemberRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    group = db.query(TeleGroup).filter(TeleGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Tele group not found")

    # Check if already a member
    existing = db.query(TeleGroupMember).filter(
        TeleGroupMember.tele_group_id == group_id,
        TeleGroupMember.user_id == payload.user_id,
    ).first()

    if existing:
        existing.is_active = True
        db.commit()
        return success_response(message="Member re-activated")

    member = TeleGroupMember(
        tele_group_id=group_id,
        user_id=payload.user_id,
        is_active=True,
    )
    db.add(member)
    db.commit()
    return success_response(message="Member added")


@router.delete("/{group_id}/members/{user_id}")
def remove_member(
    group_id: int,
    user_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    member = db.query(TeleGroupMember).filter(
        TeleGroupMember.tele_group_id == group_id,
        TeleGroupMember.user_id == user_id,
    ).first()
    if not member:
        raise HTTPException(status_code=404, detail="Member not found")

    member.is_active = False
    db.commit()
    return success_response(message="Member deactivated")


@router.post("/{group_id}/services", status_code=201)
def add_services(
    group_id: int,
    payload: AddServicesRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    group = db.query(TeleGroup).filter(TeleGroup.id == group_id).first()
    if not group:
        raise HTTPException(status_code=404, detail="Tele group not found")

    added = []
    for service_id in payload.service_ids:
        existing = db.query(TeleGroupServicePermission).filter(
            TeleGroupServicePermission.tele_group_id == group_id,
            TeleGroupServicePermission.service_id == service_id,
        ).first()
        if not existing:
            db.add(TeleGroupServicePermission(tele_group_id=group_id, service_id=service_id))
            added.append(service_id)

    db.commit()
    return success_response(data={"added_service_ids": added}, message="Services mapped")
