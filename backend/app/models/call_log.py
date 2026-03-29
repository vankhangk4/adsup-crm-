from datetime import datetime
from typing import Optional
from sqlalchemy import Integer, ForeignKey, String, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from app.models.base import utcnow


class CallLog(Base):
    __tablename__ = "call_logs"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lead_id: Mapped[int] = mapped_column(Integer, ForeignKey("leads.id"), nullable=False)
    tele_user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    call_status: Mapped[str] = mapped_column(String(50), nullable=False)  # success/failed/no_answer/busy
    call_result: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)  # contacted/rejected/callback/booked/wrong_number
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    called_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
