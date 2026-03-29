from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, Text, Index
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel, SoftDeleteMixin

if TYPE_CHECKING:
    from app.models.customer_tag import CustomerTag


class Customer(SoftDeleteMixin, BaseModel):
    __tablename__ = "customers"

    __table_args__ = (
        Index("ix_customers_normalized_phone", "normalized_phone"),
    )

    full_name: Mapped[str] = mapped_column(String(200), nullable=False)
    phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    normalized_phone: Mapped[Optional[str]] = mapped_column(String(50), nullable=True)
    email: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    gender: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)
    birth_year: Mapped[Optional[int]] = mapped_column(Integer, nullable=True)
    address: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    note: Mapped[Optional[str]] = mapped_column(Text, nullable=True)

    tags: Mapped[List["CustomerTag"]] = relationship("CustomerTag", back_populates="customer", cascade="all, delete-orphan")
