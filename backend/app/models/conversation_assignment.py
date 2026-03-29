from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import Integer, ForeignKey, DateTime, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import utcnow

if TYPE_CHECKING:
    from app.models.conversation import Conversation
    from app.models.user import User


class ConversationAssignment(Base):
    __tablename__ = "conversation_assignments"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    conversation_id: Mapped[int] = mapped_column(Integer, ForeignKey("conversations.id"), nullable=False)
    assigned_user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    assigned_by: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    assigned_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    # Relationships
    conversation: Mapped[Optional["Conversation"]] = relationship("Conversation", back_populates="assignments")
    assigned_user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[assigned_user_id])
    assigner: Mapped[Optional["User"]] = relationship("User", foreign_keys=[assigned_by])
