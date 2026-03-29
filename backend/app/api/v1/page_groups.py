from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional, List
from pydantic import BaseModel as PydanticBase

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.core.pagination import paginate
from app.models.page_group import PageGroup, PageGroupMember
from app.models.page import Page
from app.models.user import User

router = APIRouter(prefix="/page-groups", tags=["page-groups"])


class PageGroupCreate(PydanticBase):
    name: str
    code: str
    description: Optional[str] = None


class AddPagesRequest(PydanticBase):
    page_ids: List[int]


def _pg_dict(pg: PageGroup) -> dict:
    return {
        "id": pg.id,
        "name": pg.name,
        "code": pg.code,
        "description": pg.description,
        "is_active": pg.is_active,
        "created_at": pg.created_at.isoformat() if pg.created_at else None,
    }


@router.post("", status_code=201)
def create_page_group(
    payload: PageGroupCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    if db.query(PageGroup).filter(PageGroup.code == payload.code).first():
        raise HTTPException(status_code=422, detail="Page group code already exists")
    pg = PageGroup(name=payload.name, code=payload.code, description=payload.description)
    db.add(pg)
    db.commit()
    db.refresh(pg)
    return success_response(data=_pg_dict(pg), message="Page group created")


@router.post("/{group_id}/pages")
def add_pages_to_group(
    group_id: int,
    payload: AddPagesRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    pg = db.query(PageGroup).filter(PageGroup.id == group_id).first()
    if not pg:
        raise HTTPException(status_code=404, detail="Page group not found")

    for page_id in payload.page_ids:
        if not db.query(Page).filter(Page.id == page_id).first():
            raise HTTPException(status_code=404, detail=f"Page {page_id} not found")
        existing = db.query(PageGroupMember).filter(
            PageGroupMember.page_group_id == group_id,
            PageGroupMember.page_id == page_id,
        ).first()
        if not existing:
            db.add(PageGroupMember(page_group_id=group_id, page_id=page_id))

    db.commit()
    return success_response(message="Pages added to group")


@router.get("")
def list_page_groups(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(PageGroup)
    result = paginate(query, page=page, page_size=page_size)
    result["items"] = [_pg_dict(pg) for pg in result["items"]]
    return success_response(data=result, message="OK")
