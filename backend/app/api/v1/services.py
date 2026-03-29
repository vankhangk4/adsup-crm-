from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session
from typing import Optional
from pydantic import BaseModel as PydanticBase

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_permission
from app.core.response import success_response
from app.core.pagination import paginate
from app.models.service import Service
from app.models.user import User

router = APIRouter(prefix="/services", tags=["services"])


class ServiceCreate(PydanticBase):
    name: str
    code: str
    description: Optional[str] = None


class ServiceUpdate(PydanticBase):
    name: Optional[str] = None
    code: Optional[str] = None
    description: Optional[str] = None


class ServiceStatusUpdate(PydanticBase):
    is_active: bool


def _service_dict(s: Service) -> dict:
    return {
        "id": s.id,
        "name": s.name,
        "code": s.code,
        "description": s.description,
        "is_active": s.is_active,
        "created_at": s.created_at.isoformat() if s.created_at else None,
    }


@router.post("", status_code=201)
def create_service(
    payload: ServiceCreate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("service.manage")),
):
    if db.query(Service).filter((Service.name == payload.name) | (Service.code == payload.code)).first():
        raise HTTPException(status_code=422, detail="Service name or code already exists")
    svc = Service(name=payload.name, code=payload.code, description=payload.description)
    db.add(svc)
    db.commit()
    db.refresh(svc)
    return success_response(data=_service_dict(svc), message="Service created")


@router.get("")
def list_services(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    is_active: Optional[bool] = Query(True),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Service)
    if is_active is not None:
        query = query.filter(Service.is_active == is_active)
    result = paginate(query, page=page, page_size=page_size)
    result["items"] = [_service_dict(s) for s in result["items"]]
    return success_response(data=result, message="OK")


@router.get("/{service_id}")
def get_service(
    service_id: int,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    svc = db.query(Service).filter(Service.id == service_id).first()
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    return success_response(data=_service_dict(svc), message="OK")


@router.put("/{service_id}")
def update_service(
    service_id: int,
    payload: ServiceUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("service.manage")),
):
    svc = db.query(Service).filter(Service.id == service_id).first()
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    if payload.name is not None:
        svc.name = payload.name
    if payload.code is not None:
        svc.code = payload.code
    if payload.description is not None:
        svc.description = payload.description
    db.commit()
    db.refresh(svc)
    return success_response(data=_service_dict(svc), message="Service updated")


@router.patch("/{service_id}/status")
def toggle_service_status(
    service_id: int,
    payload: ServiceStatusUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(require_permission("service.manage")),
):
    svc = db.query(Service).filter(Service.id == service_id).first()
    if not svc:
        raise HTTPException(status_code=404, detail="Service not found")
    svc.is_active = payload.is_active
    db.commit()
    db.refresh(svc)
    return success_response(data=_service_dict(svc), message="Status updated")
