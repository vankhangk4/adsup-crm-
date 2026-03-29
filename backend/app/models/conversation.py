from datetime import datetime
from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey, DateTime, Boolean, Text, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel, SoftDeleteMixin

if TYPE_CHECKING:
    from app.models.page import Page
    from app.models.page_account import PageAccount
    from app.models.user import User
    from app.models.message import Message
    from app.models.conversation_tag import ConversationTag
    from app.models.conversation_assignment import ConversationAssignment


class Conversation(SoftDeleteMixin, BaseModel):
    __tablename__ = "conversations"

    __table_args__ = (
        Index("ix_conversations_page_id", "page_id"),
        Index("ix_conversations_assigned_page_user_id", "assigned_page_user_id"),
        Index("ix_conversations_status", "conversation_status"),
        Index("ix_conversations_last_message_time", "last_message_time"),
    )

    page_id: Mapped[int] = mapped_column(Integer, ForeignKey("pages.id"), nullable=False)
    page_account_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("page_accounts.id"), nullable=True)
    external_customer_id: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    customer_name: Mapped[Optional[str]] = mapped_column(String(200), nullable=True)
    customer_avatar: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    assigned_page_user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    conversation_status: Mapped[str] = mapped_column(String(50), default="open", nullable=False)
    last_message: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    last_message_time: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    is_hot: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    phone_collected: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    collected_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    waiting_for_tele: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)
    internal_note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    # Relationships
    page: Mapped[Optional["Page"]] = relationship("Page")
    page_account: Mapped[Optional["PageAccount"]] = relationship("PageAccount")
    assigned_user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[assigned_page_user_id])
    messages: Mapped[List["Message"]] = relationship("Message", back_populates="conversation", cascade="all, delete-orphan")
    tags: Mapped[List["ConversationTag"]] = relationship("ConversationTag", back_populates="conversation", cascade="all, delete-orphan")
    assignments: Mapped[List["ConversationAssignment"]] = relationship("ConversationAssignment", back_populates="conversation", cascade="all, delete-orphan")
