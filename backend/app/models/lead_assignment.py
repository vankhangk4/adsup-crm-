from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Integer, ForeignKey, Boolean, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import utcnow

if TYPE_CHECKING:
    from app.models.lead import Lead
    from app.models.user import User


class LeadAssignment(Base):
    __tablename__ = "lead_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lead_id: Mapped[int] = mapped_column(Integer, ForeignKey("leads.id"), nullable=False)
    assigned_user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_group_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("tele_groups.id"), nullable=True)
    assignment_type: Mapped[str] = mapped_column(String(50), default="manual", nullable=False)  # manual/auto/queue_release
    assigned_by: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    lead: Mapped[Optional["Lead"]] = relationship("Lead", foreign_keys=[lead_id])
    assigned_user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[assigned_user_id])
    assigner: Mapped[Optional["User"]] = relationship("User", foreign_keys=[assigned_by])
