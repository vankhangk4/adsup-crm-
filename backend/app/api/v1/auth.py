import hashlib
from datetime import datetime, timedelta, timezone
from fastapi import APIRouter, Depends, HTTPException, status
from sqlalchemy.orm import Session

from app.core.database import get_db
from app.core.security import verify_password
from app.core.jwt import create_access_token, create_refresh_token, decode_access_token
from app.core.dependencies import get_current_user
from app.core.config import settings
from app.core.response import success_response, error_response
from app.models.user import User
from app.models.refresh_token import RefreshToken
from app.models.activity_log import ActivityLog
from app.schemas.auth import LoginRequest, RefreshRequest, LogoutRequest

router = APIRouter(prefix="/auth", tags=["auth"])


def _hash_token(token: str) -> str:
    return hashlib.sha256(token.encode()).hexdigest()


@router.post("/login")
def login(payload: LoginRequest, db: Session = Depends(get_db)):
    user = db.query(User).filter(
        User.email == payload.email,
        User.deleted_at.is_(None),
    ).first()

    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    if user.status != "active":
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Account is inactive or locked")

    if not verify_password(payload.password, user.password_hash):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid credentials")

    # Create tokens
    access_token = create_access_token(user.id)
    refresh_token_plain = create_refresh_token()
    token_hash = _hash_token(refresh_token_plain)

    # Store refresh token hash
    expires_at = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
    rt = RefreshToken(user_id=user.id, token_hash=token_hash, expires_at=expires_at)
    db.add(rt)

    # Update last_login_at
    user.last_login_at = datetime.now(timezone.utc)

    # Activity log
    log = ActivityLog(actor_user_id=user.id, action="login", target_type="user", target_id=user.id, description=f"User {user.email} logged in")
    db.add(log)

    db.commit()

    return success_response(
        data={
            "access_token": access_token,
            "refresh_token": refresh_token_plain,
            "token_type": "bearer",
            "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
            "user": {"id": user.id, "full_name": user.full_name, "email": user.email},
        },
        message="Login successful",
    )


@router.post("/refresh")
def refresh_token(payload: RefreshRequest, db: Session = Depends(get_db)):
    token_hash = _hash_token(payload.refresh_token)
    rt = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()

    if not rt:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid refresh token")
    if rt.revoked_at is not None:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token has been revoked")
    expires_at = rt.expires_at
    if expires_at.tzinfo is None:
        expires_at = expires_at.replace(tzinfo=timezone.utc)
    if expires_at < datetime.now(timezone.utc):
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Refresh token has expired")

    new_access_token = create_access_token(rt.user_id)
    response_data = {
        "access_token": new_access_token,
        "token_type": "bearer",
        "expires_in": settings.ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    }

    if settings.REFRESH_TOKEN_ROTATE:
        new_refresh_plain = create_refresh_token()
        new_hash = _hash_token(new_refresh_plain)
        new_expires = datetime.now(timezone.utc) + timedelta(days=settings.REFRESH_TOKEN_EXPIRE_DAYS)
        new_rt = RefreshToken(user_id=rt.user_id, token_hash=new_hash, expires_at=new_expires)
        db.add(new_rt)
        # Revoke old token
        rt.revoked_at = datetime.now(timezone.utc)
        response_data["refresh_token"] = new_refresh_plain

    db.commit()
    return success_response(data=response_data, message="Token refreshed")


@router.post("/logout")
def logout(payload: LogoutRequest, db: Session = Depends(get_db)):
    token_hash = _hash_token(payload.refresh_token)
    rt = db.query(RefreshToken).filter(RefreshToken.token_hash == token_hash).first()
    if rt and rt.revoked_at is None:
        rt.revoked_at = datetime.now(timezone.utc)
        db.commit()
    return success_response(message="Logged out successfully")


@router.get("/me")
def get_me(current_user: User = Depends(get_current_user)):
    return success_response(
        data={
            "id": current_user.id,
            "full_name": current_user.full_name,
            "email": current_user.email,
            "username": current_user.username,
            "phone": current_user.phone,
            "department_id": current_user.department_id,
            "status": current_user.status,
            "is_active": current_user.is_active,
            "online_status": current_user.online_status,
            "last_login_at": current_user.last_login_at.isoformat() if current_user.last_login_at else None,
        },
        message="OK",
    )
