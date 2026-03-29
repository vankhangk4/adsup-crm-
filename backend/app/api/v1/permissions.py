from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user
from app.core.response import success_response
from app.core.pagination import paginate
from app.models.permission import Permission
from app.models.user import User
from app.schemas.permission import PermissionCreate

router = APIRouter(prefix="/permissions", tags=["permissions"])


def _perm_dict(p: Permission) -> dict:
    return {
        "id": p.id,
        "code": p.code,
        "name": p.name,
        "description": p.description,
        "module": p.module,
        "is_active": p.is_active,
    }


@router.post("", status_code=201)
def create_permission(
    payload: PermissionCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    existing = db.query(Permission).filter(Permission.code == payload.code).first()
    if existing:
        raise HTTPException(status_code=422, detail="Permission code already exists")

    perm = Permission(code=payload.code, name=payload.name, description=payload.description, module=payload.module)
    db.add(perm)
    db.commit()
    db.refresh(perm)
    return success_response(data=_perm_dict(perm), message="Permission created")


@router.get("")
def list_permissions(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Permission)
    result = paginate(query, page=page, page_size=page_size)
    result["items"] = [_perm_dict(p) for p in result["items"]]
    return success_response(data=result, message="OK")
