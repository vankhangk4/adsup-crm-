"""Script CRUD endpoints (B114)."""
from datetime import datetime, timezone
from typing import Optional
from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from pydantic import BaseModel as PydanticBase

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_permission
from app.core.response import success_response
from app.core.pagination import paginate
from app.models.script import Script
from app.models.script_version import ScriptVersion
from app.models.user import User

router = APIRouter(prefix="/scripts", tags=["scripts"])


class ScriptCreate(PydanticBase):
    title: str
    content: str
    script_type: str  # page/tele/both
    category_id: Optional[int] = None
    service_id: Optional[int] = None
    page_id: Optional[int] = None
    tele_group_id: Optional[int] = None


class ScriptUpdate(PydanticBase):
    title: Optional[str] = None
    content: Optional[str] = None
    script_type: Optional[str] = None
    category_id: Optional[int] = None
    service_id: Optional[int] = None
    page_id: Optional[int] = None
    tele_group_id: Optional[int] = None


def _script_dict(s: Script) -> dict:
    return {
        "id": s.id,
        "title": s.title,
        "content": s.content,
        "script_type": s.script_type,
        "category_id": s.category_id,
        "service_id": s.service_id,
        "page_id": s.page_id,
        "tele_group_id": s.tele_group_id,
        "is_active": s.is_active,
        "deleted_at": s.deleted_at.isoformat() if s.deleted_at else None,
        "created_at": s.created_at.isoformat() if s.created_at else None,
        "updated_at": s.updated_at.isoformat() if s.updated_at else None,
    }


@router.post("", status_code=201)
def create_script(
    payload: ScriptCreate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("script.manage")),
):
    from app.services.activity_service import log_activity
    script = Script(
        title=payload.title,
        content=payload.content,
        script_type=payload.script_type,
        category_id=payload.category_id,
        service_id=payload.service_id,
        page_id=payload.page_id,
        tele_group_id=payload.tele_group_id,
        created_by=current_user.id,
    )
    db.add(script)
    db.flush()
    log_activity(db, current_user.id, "create_script", "script", script.id, f"Script '{script.title}' created")
    db.commit()
    db.refresh(script)
    return success_response(data=_script_dict(script), message="Script created")


@router.get("")
def list_scripts(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    script_type: Optional[str] = Query(None),
    service_id: Optional[int] = Query(None),
    page_id: Optional[int] = Query(None),
    tele_group_id: Optional[int] = Query(None),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Script).filter(Script.deleted_at.is_(None))
    if script_type:
        query = query.filter(Script.script_type == script_type)
    if service_id is not None:
        query = query.filter(Script.service_id == service_id)
    if page_id is not None:
        query = query.filter(Script.page_id == page_id)
    if tele_group_id is not None:
        query = query.filter(Script.tele_group_id == tele_group_id)
    query = query.order_by(Script.created_at.desc())
    result = paginate(query, page=page, page_size=page_size)
    result["items"] = [_script_dict(s) for s in result["items"]]
    return success_response(data=result, message="OK")


@router.get("/{script_id}")
def get_script(
    script_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    script = db.query(Script).filter(Script.id == script_id, Script.deleted_at.is_(None)).first()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")
    return success_response(data=_script_dict(script), message="OK")


@router.put("/{script_id}")
def update_script(
    script_id: int,
    payload: ScriptUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("script.manage")),
):
    from app.services.activity_service import log_activity
    script = db.query(Script).filter(Script.id == script_id, Script.deleted_at.is_(None)).first()
    if not script:
        raise HTTPException(status_code=404, detail="Script not found")

    # Snapshot current content if content is being updated
    if payload.content is not None and payload.content != script.content:
        last_version = (
            db.query(ScriptVersion)
            .filter(ScriptVersion.script_id == script_id)
            .order_by(ScriptVersion.version_no.desc())
            .first()
        )
        next_version_no = (last_version.version_no + 1) if last_version else 1
        db.add(ScriptVersion(
            script_id=script_id,
            version_no=next_version_no,
            content=script.content,
            created_by=current_user.id,
        ))

    for field, value in payload.model_dump(exclude_unset=True).items():
        setattr(script, field, value)
    script.updated_by = current_user.id

    log_activity(db, current_user.id, "update_script", "script", script_id, f"Script '{script.title}' updated")
    db.commit()
    db.refresh(script)
    return success_response(data=_script_dict(script), message="Script updated")
