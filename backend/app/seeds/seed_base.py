"""Seed base data: departments, roles, permissions, services, channels, and assign all permissions to super_admin."""
import sys
import os

sys.path.insert(0, os.path.dirname(os.path.dirname(os.path.dirname(os.path.abspath(__file__)))))

from app.core.database import SessionLocal, engine
from app.models import Department, Role, Permission, RolePermission
from app.models.service import Service
from app.models.channel import Channel
from app.models.lead_status import LeadStatus
from app.models.system_setting import SystemSetting
import app.models  # ensure all models registered


DEPARTMENTS = [
    {"name": "admin", "description": "Administration"},
    {"name": "page", "description": "Page / Social Media"},
    {"name": "tele", "description": "Telesales"},
    {"name": "marketing", "description": "Marketing"},
    {"name": "manager", "description": "Management"},
]

ROLES = [
    {"name": "Super Admin", "code": "super_admin", "description": "Full access"},
    {"name": "Admin", "code": "admin", "description": "Administrative access"},
    {"name": "Manager", "code": "manager", "description": "Manager access"},
    {"name": "Page Staff", "code": "page_staff", "description": "Page staff access"},
    {"name": "Page Lead", "code": "page_lead", "description": "Page lead access"},
    {"name": "Tele Staff", "code": "tele_staff", "description": "Tele staff access"},
    {"name": "Tele Lead", "code": "tele_lead", "description": "Tele lead access"},
]

SERVICES = [
    {"name": "Filler", "code": "filler", "description": "Filler treatment"},
    {"name": "Mi", "code": "mi", "description": "Mi treatment"},
    {"name": "Nâng Mũi", "code": "nang_mui", "description": "Nose augmentation"},
    {"name": "Da Liễu", "code": "da_lieu", "description": "Dermatology"},
]

CHANNELS = [
    {"name": "Facebook", "code": "facebook", "description": "Facebook channel"},
    {"name": "Zalo", "code": "zalo", "description": "Zalo channel"},
    {"name": "Instagram", "code": "instagram", "description": "Instagram channel"},
    {"name": "OA", "code": "oa", "description": "Official Account channel"},
    {"name": "Manual", "code": "manual", "description": "Manual entry"},
]

LEAD_STATUSES = [
    {"name": "Mới", "code": "new", "sort_order": 1, "display_name": "Mới"},
    {"name": "Tiềm năng", "code": "qualified", "sort_order": 2, "display_name": "Tiềm năng"},
    {"name": "Đã phân công", "code": "assigned", "sort_order": 3, "display_name": "Đã phân công"},
    {"name": "Đã liên hệ", "code": "contacted", "sort_order": 4, "display_name": "Đã liên hệ"},
    {"name": "Đang xử lý", "code": "follow_up", "sort_order": 5, "display_name": "Đang xử lý"},
    {"name": "Đã hẹn", "code": "booked", "sort_order": 6, "display_name": "Đã hẹn"},
    {"name": "Đã ghé thăm", "code": "visited", "sort_order": 7, "display_name": "Đã ghé thăm"},
    {"name": "Thành công", "code": "won", "sort_order": 8, "display_name": "Thành công"},
    {"name": "Từ chối", "code": "lost", "sort_order": 9, "display_name": "Từ chối"},
    {"name": "Trùng lặp", "code": "duplicate", "sort_order": 10, "display_name": "Trùng lặp"},
    {"name": "Lưu trữ", "code": "archived", "sort_order": 11, "display_name": "Lưu trữ"},
]

PERMISSIONS = [
    {"code": "user.read", "name": "Read Users", "module": "user"},
    {"code": "user.create", "name": "Create Users", "module": "user"},
    {"code": "user.update", "name": "Update Users", "module": "user"},
    {"code": "page.read", "name": "Read Pages", "module": "page"},
    {"code": "page.manage", "name": "Manage Pages", "module": "page"},
    {"code": "service.manage", "name": "Manage Services", "module": "service"},
    {"code": "lead.read", "name": "Read Leads", "module": "lead"},
    {"code": "lead.create", "name": "Create Leads", "module": "lead"},
    {"code": "lead.update", "name": "Update Leads", "module": "lead"},
    {"code": "lead.assign", "name": "Assign Leads", "module": "lead"},
    {"code": "script.read", "name": "Read Scripts", "module": "script"},
    {"code": "script.manage", "name": "Manage Scripts", "module": "script"},
    {"code": "routing.manage", "name": "Manage Routing", "module": "routing"},
    {"code": "tele.follow_up", "name": "Tele Follow Up", "module": "tele"},
    {"code": "report.read", "name": "Read Reports", "module": "report"},
    {"code": "setting.manage", "name": "Manage Settings", "module": "setting"},
    {"code": "conversation.read", "name": "Read Conversations", "module": "conversation"},
    {"code": "conversation.assign", "name": "Assign Conversations", "module": "conversation"},
]


SYSTEM_SETTINGS = [
    {"key": "duplicate_policy", "value": "warn", "description": "Policy when duplicate lead detected"},
    {"key": "default_lead_status", "value": "new", "description": "Default status for new leads"},
    {"key": "enable_auto_routing", "value": "true", "description": "Enable automatic lead routing"},
]


def seed(db):
    # Departments
    for d in DEPARTMENTS:
        if not db.query(Department).filter(Department.name == d["name"]).first():
            db.add(Department(**d))

    # Roles
    for r in ROLES:
        if not db.query(Role).filter(Role.code == r["code"]).first():
            db.add(Role(**r))

    # Permissions
    for p in PERMISSIONS:
        if not db.query(Permission).filter(Permission.code == p["code"]).first():
            db.add(Permission(**p))

    # Services (B035)
    for s in SERVICES:
        if not db.query(Service).filter(Service.code == s["code"]).first():
            db.add(Service(**s))

    # Channels (B036)
    for c in CHANNELS:
        if not db.query(Channel).filter(Channel.code == c["code"]).first():
            db.add(Channel(**c))

    # Lead statuses (B070)
    for ls in LEAD_STATUSES:
        if not db.query(LeadStatus).filter(LeadStatus.code == ls["code"]).first():
            db.add(LeadStatus(**ls))

    # System settings (B118)
    for ss in SYSTEM_SETTINGS:
        if not db.query(SystemSetting).filter(SystemSetting.key == ss["key"]).first():
            db.add(SystemSetting(**ss))

    db.commit()

    # Assign all permissions to super_admin
    super_admin = db.query(Role).filter(Role.code == "super_admin").first()
    if super_admin:
        all_perms = db.query(Permission).all()
        for perm in all_perms:
            exists = db.query(RolePermission).filter(
                RolePermission.role_id == super_admin.id,
                RolePermission.permission_id == perm.id,
            ).first()
            if not exists:
                db.add(RolePermission(role_id=super_admin.id, permission_id=perm.id))
        db.commit()

    print("Base seed completed.")


if __name__ == "__main__":
    from app.core.database import Base
    Base.metadata.create_all(bind=engine)
    db = SessionLocal()
    try:
        seed(db)
    finally:
        db.close()
