from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, ForeignKey, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from app.models.base import utcnow


class Appointment(Base):
    __tablename__ = "appointments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lead_id: Mapped[int] = mapped_column(Integer, ForeignKey("leads.id"), nullable=False)
    tele_user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    appointment_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), nullable=False)
    appointment_branch: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    status: Mapped[str] = mapped_column(String(50), default="scheduled", nullable=False)  # scheduled/visited/cancelled/no_show
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, onupdate=utcnow, nullable=False)
