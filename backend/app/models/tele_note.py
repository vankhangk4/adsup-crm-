from datetime import datetime
from sqlalchemy import Integer, ForeignKey, Text, DateTime
from sqlalchemy.orm import Mapped, mapped_column
from app.core.database import Base
from app.models.base import utcnow


class TeleNote(Base):
    __tablename__ = "tele_notes"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    lead_id: Mapped[int] = mapped_column(Integer, ForeignKey("leads.id"), nullable=False)
    tele_user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    note: Mapped[str] = mapped_column(Text, nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
