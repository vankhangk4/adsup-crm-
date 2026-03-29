from fastapi import APIRouter, Depends, HTTPException, Query
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.dependencies import get_current_user, require_permission
from app.core.response import success_response
from app.core.pagination import paginate
from app.models.role import Role
from app.models.permission import Permission
from app.models.role_permission import RolePermission
from app.models.user import User
from app.schemas.role import RoleCreate, RoleUpdate, AssignPermissionsRequest

router = APIRouter(prefix="/roles", tags=["roles"])


def _role_dict(role: Role) -> dict:
    return {
        "id": role.id,
        "name": role.name,
        "code": role.code,
        "description": role.description,
        "is_active": role.is_active,
    }


@router.post("", status_code=201)
def create_role(
    payload: RoleCreate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    existing = db.query(Role).filter((Role.name == payload.name) | (Role.code == payload.code)).first()
    if existing:
        raise HTTPException(status_code=422, detail="Role name or code already exists")

    role = Role(name=payload.name, code=payload.code, description=payload.description)
    db.add(role)
    db.commit()
    db.refresh(role)
    return success_response(data=_role_dict(role), message="Role created")


@router.get("")
def list_roles(
    page: int = Query(1, ge=1),
    page_size: int = Query(20, ge=1, le=100),
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    query = db.query(Role)
    result = paginate(query, page=page, page_size=page_size)
    result["items"] = [_role_dict(r) for r in result["items"]]
    return success_response(data=result, message="OK")


@router.put("/{role_id}")
def update_role(
    role_id: int,
    payload: RoleUpdate,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    if payload.name is not None:
        role.name = payload.name
    if payload.code is not None:
        role.code = payload.code
    if payload.description is not None:
        role.description = payload.description

    db.commit()
    db.refresh(role)
    return success_response(data=_role_dict(role), message="Role updated")


@router.post("/{role_id}/permissions")
def assign_permissions_to_role(
    role_id: int,
    payload: AssignPermissionsRequest,
    db: Session = Depends(get_db),
    _: User = Depends(get_current_user),
):
    role = db.query(Role).filter(Role.id == role_id).first()
    if not role:
        raise HTTPException(status_code=404, detail="Role not found")

    # Resolve permission IDs
    perm_ids = set()  # type: ignore
    if payload.permission_ids:
        perm_ids.update(payload.permission_ids)
    if payload.codes:
        perms = db.query(Permission).filter(Permission.code.in_(payload.codes)).all()
        perm_ids.update(p.id for p in perms)

    # Replace all permissions
    db.query(RolePermission).filter(RolePermission.role_id == role_id).delete()
    for pid in perm_ids:
        db.add(RolePermission(role_id=role_id, permission_id=pid))

    db.commit()
    return success_response(message="Permissions assigned to role")
