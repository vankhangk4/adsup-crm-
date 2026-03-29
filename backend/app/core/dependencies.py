from fastapi import Depends, HTTPException, status
from fastapi.security import OAuth2PasswordBearer
from sqlalchemy.orm import Session
from app.core.database import get_db
from app.core.jwt import decode_access_token

oauth2_scheme = OAuth2PasswordBearer(tokenUrl="/api/v1/auth/login")


def get_current_user(
    token: str = Depends(oauth2_scheme),
    db: Session = Depends(get_db),
):
    """Decode JWT, load user, reject if not found or inactive/locked."""
    from app.models.user import User

    user_id = decode_access_token(token)
    user = db.query(User).filter(User.id == user_id, User.deleted_at.is_(None)).first()
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")
    if user.status in ("inactive", "locked"):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account is inactive or locked")
    return user


def require_permission(code: str):
    """Return a dependency that checks if current user has the given permission code."""
    def _check(current_user=Depends(get_current_user), db: Session = Depends(get_db)):
        from app.models.user_role import UserRole
        from app.models.role_permission import RolePermission
        from app.models.permission import Permission

        has_perm = (
            db.query(Permission)
            .join(RolePermission, RolePermission.permission_id == Permission.id)
            .join(UserRole, UserRole.role_id == RolePermission.role_id)
            .filter(UserRole.user_id == current_user.id, Permission.code == code)
            .first()
        )
        if not has_perm:
            raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail=f"Permission '{code}' required")
        return current_user

    return _check


__all__ = ["get_db", "get_current_user", "require_permission", "oauth2_scheme"]
