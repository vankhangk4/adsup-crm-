"""System settings endpoints (B118)."""
from fastapi import APIRouter, Depends, HTTPException
from sqlalchemy.orm import Session
from pydantic import BaseModel as PydanticBase
from typing import Optional

from app.core.database import get_db
from app.core.dependencies import require_permission
from app.core.response import success_response
from app.models.system_setting import SystemSetting
from app.models.user import User

router = APIRouter(prefix="/settings", tags=["settings"])


class SettingUpdate(PydanticBase):
    value: str
    description: Optional[str] = None


def _setting_dict(s: SystemSetting) -> dict:
    return {
        "id": s.id,
        "key": s.key,
        "value": s.value,
        "description": s.description,
        "updated_at": s.updated_at.isoformat() if s.updated_at else None,
        "updated_by": s.updated_by,
    }


@router.get("")
def list_settings(
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("setting.manage")),
):
    settings = db.query(SystemSetting).order_by(SystemSetting.key).all()
    return success_response(data=[_setting_dict(s) for s in settings], message="OK")


@router.put("/{key}")
def update_setting(
    key: str,
    payload: SettingUpdate,
    db: Session = Depends(get_db),
    current_user: User = Depends(require_permission("setting.manage")),
):
    setting = db.query(SystemSetting).filter(SystemSetting.key == key).first()
    if not setting:
        raise HTTPException(status_code=404, detail=f"Setting '{key}' not found")
    setting.value = payload.value
    if payload.description is not None:
        setting.description = payload.description
    setting.updated_by = current_user.id
    db.commit()
    db.refresh(setting)
    return success_response(data=_setting_dict(setting), message="Setting updated")
