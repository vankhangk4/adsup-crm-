from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, Float, Boolean, Text, DateTime, ForeignKey, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel, SoftDeleteMixin

if TYPE_CHECKING:
    from app.models.customer import Customer
    from app.models.conversation import Conversation
    from app.models.service import Service
    from app.models.lead_source import LeadSource
    from app.models.user import User


class Lead(SoftDeleteMixin, BaseModel):
    __tablename__ = "leads"

    __table_args__ = (
        Index("ix_leads_customer_id", "customer_id"),
        Index("ix_leads_service_id", "service_id"),
        Index("ix_leads_page_id", "page_id"),
        Index("ix_leads_tele_user_id", "tele_user_id"),
        Index("ix_leads_tele_group_id", "tele_group_id"),
        Index("ix_leads_lead_status_code", "lead_status_code"),
        Index("ix_leads_created_at", "created_at"),
    )

    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id"), nullable=False)
    conversation_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("conversations.id"), nullable=True)
    page_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("pages.id"), nullable=True)
    page_user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    tele_user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    tele_group_id: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    marketing_user_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("users.id"), nullable=True)
    service_id: Mapped[int] = mapped_column(Integer, ForeignKey("services.id"), nullable=False)
    source_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("lead_sources.id"), nullable=True)
    campaign_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    ad_name: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    lead_status_code: Mapped[str] = mapped_column(String(50), default="new", nullable=False)
    interest_level: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)  # cold/warm/hot
    note_page: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    note_tele: Mapped[Optional[str]] = mapped_column(Text, nullable=True)
    booked_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    visited_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    closed_at: Mapped[Optional[datetime]] = mapped_column(DateTime(timezone=True), nullable=True)
    revenue: Mapped[Optional[float]] = mapped_column(Float, nullable=True)
    is_duplicate: Mapped[bool] = mapped_column(Boolean, default=False, nullable=False)

    # Relationships
    customer: Mapped[Optional["Customer"]] = relationship("Customer", foreign_keys=[customer_id])
    conversation: Mapped[Optional["Conversation"]] = relationship("Conversation", foreign_keys=[conversation_id])
    service: Mapped[Optional["Service"]] = relationship("Service", foreign_keys=[service_id])
    source: Mapped[Optional["LeadSource"]] = relationship("LeadSource", foreign_keys=[source_id])
    tele_user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[tele_user_id])
    page_user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[page_user_id])
    marketing_user: Mapped[Optional["User"]] = relationship("User", foreign_keys=[marketing_user_id])
