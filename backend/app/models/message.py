from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey, DateTime, Text
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel, utcnow

if TYPE_CHECKING:
    from app.models.conversation import Conversation
    from app.models.user import User


class Message(BaseModel):
    __tablename__ = "messages"

    conversation_id: Mapped[int] = mapped_column(Integer, ForeignKey("conversations.id"), nullable=False)
    sender_type: Mapped[str] = mapped_column(String(50), nullable=False)  # customer/page_staff/system
    sender_user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    message_text: Mapped[str] = mapped_column(Text, nullable=False)
    message_type: Mapped[str] = mapped_column(String(50), default="text", nullable=False)  # text/image/file/system
    sent_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    # Relationships
    conversation: Mapped[Optional["Conversation"]] = relationship("Conversation", back_populates="messages")
    sender_user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[sender_user_id])
