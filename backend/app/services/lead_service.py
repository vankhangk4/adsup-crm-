from datetime import datetime, timezone, timedelta
from sqlalchemy.orm import Session
from app.models.lead import Lead


def check_duplicate(db: Session, customer_id: int, service_id: int) -> bool:
    """
    Check if a customer already has an active lead for the same service within 30 days.
    Returns True if duplicate, False otherwise.
    Does NOT block creation — caller should set is_duplicate=True and include warning.
    """
    cutoff = datetime.now(timezone.utc) - timedelta(days=30)
    existing = (
        db.query(Lead)
        .filter(
            Lead.customer_id == customer_id,
            Lead.service_id == service_id,
            Lead.deleted_at.is_(None),
            Lead.created_at >= cutoff,
            Lead.lead_status_code.notin_(["won", "lost", "archived"]),
        )
        .first()
    )
    return existing is not None
