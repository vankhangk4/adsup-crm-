from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel as PydanticBase

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_permission
from app.core.response import success_response
from app.core.pagination import paginate
from app.models.page import Page
from app.models.channel import Channel
from app.models.page_user_assignment import PageUserAssignment
from app.models.user import User
from app.models.permission import Permission
from app.models.role_permission import RolePermission
from app.models.user_role import UserRole

router = APIRouter(prefix="/pages", tags=["pages"])


class PageCreate(PydanticBase):
    channel_id: int
    page_name: str
    page_code: str
    page_type: Optional[str] = None
    page_status: str = "active"
    external_page_ref: Optional[str] = None


class PageUpdate(PydanticBase):
    channel_id: Optional[int] = None
    page_name: Optional[str] = None
    page_type: Optional[str] = None
    page_status: Optional[str] = None
    external_page_ref: Optional[str] = None


class PageStatusUpdate(PydanticBase):
    is_active: bool


class AssignUsersRequest(PydanticBase):
    user_ids: List[int]


def _page_dict(p: Page) -> dict:
    return {
        "id": p.id,
        "channel_id": p.channel_id,
        "page_name": p.page_name,
        "page_code": p.page_code,
        "page_type": p.page_type,
        "page_status": p.page_status,
        "external_page_ref": p.external_page_ref,
        "is_active": p.is_active,
        "created_at": p.created_at.isoformat() if p.created_at else None,
    }


def _has_permission(db: Session, user_id: int, code: str) -> bool:
    return bool(
        db.query(Permission)
        .join(RolePermission, RolePermission.permission_id == Permission.id)
        .join(UserRole, UserRole.role_id == RolePermission.role_id)
        .filter(UserRole.user_id == user_id, Permission.code == code)
        .first()
    )


@router.post("", status_code=201)
def create_page(
    payload: PageCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("page.manage")),
):
    if not db.query(Channel).filter(Channel.id == payload.channel_id).first():
        raise HTTPException(status_code=422, detail="Channel not found")
    if db.query(Page).filter(Page.page_code == payload.page_code).first():
        raise HTTPException(status_code=422, detail="Page code already exists")
    page = Page(
        channel_id=payload.channel_id,
        page_name=payload.page_name,
        page_code=payload.page_code,
        page_type=payload.page_type,
        page_status=payload.page_status,
        external_page_ref=payload.external_page_ref,
    )
    db.add(page)
    db.commit()
    db.refresh(page)
    return success_response(data=_page_dict(page), message="Page created")


@router.get("")
def list_pages(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    query = db.query(Page)
    # B046: scope — if user has page.manage, see all; otherwise only assigned pages
    if not _has_permission(db, current_user.id, "page.manage"):
        assigned_page_ids = (
            db.query(PageUserAssignment.page_id)
            .filter(
                PageUserAssignment.user_id == current_user.id,
                PageUserAssignment.is_active == True,
            )
            .subquery()
        )
        query = query.filter(Page.id.in_(assigned_page_ids))
    result = paginate(query, page=page, page_size=page_size)
    result["items"] = [_page_dict(p) for p in result["items"]]
    return success_response(data=result, message="OK")


@router.get("/{page_id}")
def get_page(
    page_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    p = db.query(Page).filter(Page.id == page_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Page not found")
    return success_response(data=_page_dict(p), message="OK")


@router.put("/{page_id}")
def update_page(
    page_id: int,
    payload: PageUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("page.manage")),
):
    p = db.query(Page).filter(Page.id == page_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Page not found")
    if payload.channel_id is not None:
        if not db.query(Channel).filter(Channel.id == payload.channel_id).first():
            raise HTTPException(status_code=422, detail="Channel not found")
        p.channel_id = payload.channel_id
    if payload.page_name is not None:
        p.page_name = payload.page_name
    if payload.page_type is not None:
        p.page_type = payload.page_type
    if payload.page_status is not None:
        p.page_status = payload.page_status
    if payload.external_page_ref is not None:
        p.external_page_ref = payload.external_page_ref
    db.commit()
    db.refresh(p)
    return success_response(data=_page_dict(p), message="Page updated")


@router.patch("/{page_id}/status")
def toggle_page_status(
    page_id: int,
    payload: PageStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("page.manage")),
):
    p = db.query(Page).filter(Page.id == page_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Page not found")
    p.is_active = payload.is_active
    db.commit()
    db.refresh(p)
    return success_response(data=_page_dict(p), message="Status updated")


@router.post("/{page_id}/assign-users")
def assign_users_to_page(
    page_id: int,
    payload: AssignUsersRequest,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("page.manage")),
):
    p = db.query(Page).filter(Page.id == page_id).first()
    if not p:
        raise HTTPException(status_code=404, detail="Page not found")

    for user_id in payload.user_ids:
        if not db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first():
            raise HTTPException(status_code=404, detail=f"User {user_id} not found")
        existing = db.query(PageUserAssignment).filter(
            PageUserAssignment.page_id == page_id,
            PageUserAssignment.user_id == user_id,
        ).first()
        if existing:
            existing.is_active = True
        else:
            db.add(PageUserAssignment(page_id=page_id, user_id=user_id, is_active=True))

    db.commit()
    return success_response(message="Users assigned to page")
