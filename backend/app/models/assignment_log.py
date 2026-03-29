from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, ForeignKey, String, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from app.models.base import utcnow


class AssignmentLog(Base):
    __tablename__ = "assignment_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lead_id: Mapped[int] = mapped_column(Integer, ForeignKey("leads.id"), nullable=False)
    action: Mapped[str] = mapped_column(String(100), nullable=False)
    from_user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    to_user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    from_group_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("tele_groups.id"), nullable=True)
    to_group_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("tele_groups.id"), nullable=True)
    note: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
