from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel as PydanticBase

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.core.pagination import paginate
from app.models.channel import Channel
from app.models.user import User

router = APIRouter(prefix="/channels", tags=["channels"])


class ChannelCreate(PydanticBase):
    name: str
    code: str
    description: Optional[str] = None


class ChannelUpdate(PydanticBase):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None


def _channel_dict(c: Channel) -> dict:
    return {
        "id": c.id,
        "name": c.name,
        "code": c.code,
        "description": c.description,
        "is_active": c.is_active,
        "created_at": c.created_at.isoformat() if c.created_at else None,
    }


@router.post("", status_code=201)
def create_channel(
    payload: ChannelCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    if db.query(Channel).filter(Channel.code == payload.code).first():
        raise HTTPException(status_code=422, detail="Channel code already exists")
    ch = Channel(name=payload.name, code=payload.code, description=payload.description)
    db.add(ch)
    db.commit()
    db.refresh(ch)
    return success_response(data=_channel_dict(ch), message="Channel created")


@router.get("")
def list_channels(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Channel)
    result = paginate(query, page=page, page_size=page_size)
    result["items"] = [_channel_dict(c) for c in result["items"]]
    return success_response(data=result, message="OK")


@router.put("/{channel_id}")
def update_channel(
    channel_id: int,
    payload: ChannelUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    ch = db.query(Channel).filter(Channel.id == channel_id).first()
    if not ch:
        raise HTTPException(status_code=404, detail="Channel not found")
    if payload.name is not None:
        ch.name = payload.name
    if payload.code is not None:
        existing = db.query(Channel).filter(Channel.code == payload.code, Channel.id != channel_id).first()
        if existing:
            raise HTTPException(status_code=422, detail="Channel code already exists")
        ch.code = payload.code
    if payload.description is not None:
        ch.description = payload.description
    db.commit()
    db.refresh(ch)
    return success_response(data=_channel_dict(ch), message="Channel updated")
