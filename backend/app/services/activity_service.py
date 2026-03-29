"""Reusable activity log helper (B117)."""
from typing import Optional
from sqlalchemy.orm import Session
from app.models.activity_log import ActivityLog


def log_activity(
    db: Session,
    actor_id: Optional[int],
    action: str,
    target_type: Optional[str] = None,
    target_id: Optional[int] = None,
    description: Optional[str] = None,
) -> ActivityLog:
    """
    Write an activity log entry.
    Supported actions: login, create_lead, update_lead, assign_lead, update_lead_status,
                       create_script, update_script, create_user, update_user, etc.
    Does NOT commit — caller is responsible for committing the session.
    """
    entry = ActivityLog(
        actor_user_id=actor_id,
        action=action,
        target_type=target_type,
        target_id=target_id,
        description=description,
    )
    db.add(entry)
    return entry
