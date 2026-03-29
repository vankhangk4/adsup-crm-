"""Seed default admin user from environment variables."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.database import SessionLocal, engine
from app.core.security import hash_password
from app.models import User, Role, UserRole
import app.models  # ensure all models registered


def seed(db):
    admin_email = os.environ.get("ADMIN_EMAIL", "admin@crm.vn")
    admin_password = os.environ.get("ADMIN_PASSWORD", "Admin@123")

    existing = db.query(User).filter(User.email == admin_email).first()
    if existing:
        print(f"Admin user {admin_email} already exists.")
        return

    super_admin_role = db.query(Role).filter(Role.code == "super_admin").first()
    if not super_admin_role:
        print("super_admin role not found. Run seed_base.py first.")
        return

    user = User(
        full_name="Super Admin",
        email=admin_email,
        password_hash=hash_password(admin_password),
        status="active",
    )
    db.add(user)
    db.flush()

    db.add(UserRole(user_id=user.id, role_id=super_admin_role.id))
    db.commit()
    print(f"Admin user created: {admin_email}")


if __name__ == "__main__":
    from app.core.database import Base
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
