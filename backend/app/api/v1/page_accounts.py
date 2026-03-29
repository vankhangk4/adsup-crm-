from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel as PydanticBase

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.core.pagination import paginate
from app.models.page_account import PageAccount
from app.models.page import Page
from app.models.user import User

router = APIRouter(prefix="/page-accounts", tags=["page-accounts"])


class PageAccountCreate(PydanticBase):
    page_id: int
    nick_name: str
    nick_type: Optional[str] = None
    external_account_ref: Optional[str] = None


class PageAccountUpdate(PydanticBase):
    nick_name: Optional[str] = None
    nick_type: Optional[str] = None
    external_account_ref: Optional[str] = None


class PageAccountStatusUpdate(PydanticBase):
    is_active: bool


def _pa_dict(pa: PageAccount) -> dict:
    return {
        "id": pa.id,
        "page_id": pa.page_id,
        "nick_name": pa.nick_name,
        "nick_type": pa.nick_type,
        "external_account_ref": pa.external_account_ref,
        "is_active": pa.is_active,
        "created_at": pa.created_at.isoformat() if pa.created_at else None,
    }


@router.post("", status_code=201)
def create_page_account(
    payload: PageAccountCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    if not db.query(Page).filter(Page.id == payload.page_id).first():
        raise HTTPException(status_code=422, detail="Page not found")
    pa = PageAccount(
        page_id=payload.page_id,
        nick_name=payload.nick_name,
        nick_type=payload.nick_type,
        external_account_ref=payload.external_account_ref,
    )
    db.add(pa)
    db.commit()
    db.refresh(pa)
    return success_response(data=_pa_dict(pa), message="Page account created")


@router.get("")
def list_page_accounts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    page_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(PageAccount)
    if page_id is not None:
        query = query.filter(PageAccount.page_id == page_id)
    result = paginate(query, page=page, page_size=page_size)
    result["items"] = [_pa_dict(pa) for pa in result["items"]]
    return success_response(data=result, message="OK")


@router.put("/{account_id}")
def update_page_account(
    account_id: int,
    payload: PageAccountUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    pa = db.query(PageAccount).filter(PageAccount.id == account_id).first()
    if not pa:
        raise HTTPException(status_code=404, detail="Page account not found")
    if payload.nick_name is not None:
        pa.nick_name = payload.nick_name
    if payload.nick_type is not None:
        pa.nick_type = payload.nick_type
    if payload.external_account_ref is not None:
        pa.external_account_ref = payload.external_account_ref
    db.commit()
    db.refresh(pa)
    return success_response(data=_pa_dict(pa), message="Page account updated")


@router.patch("/{account_id}/status")
def toggle_page_account_status(
    account_id: int,
    payload: PageAccountStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    pa = db.query(PageAccount).filter(PageAccount.id == account_id).first()
    if not pa:
        raise HTTPException(status_code=404, detail="Page account not found")
    pa.is_active = payload.is_active
    db.commit()
    db.refresh(pa)
    return success_response(data=_pa_dict(pa), message="Status updated")
