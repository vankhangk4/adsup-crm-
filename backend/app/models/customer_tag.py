from datetime import datetime
from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey, DateTime
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import utcnow

if TYPE_CHECKING:
    from app.models.customer import Customer


class CustomerTag(Base):
    __tablename__ = "customer_tags"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    customer_id: Mapped[int] = mapped_column(Integer, ForeignKey("customers.id"), nullable=False)
    tag_name: Mapped[str] = mapped_column(String(100), nullable=False)
    created_at: Mapped[datetime] = mapped_column(DateTime(timezone=True), default=utcnow, nullable=False)

    customer: Mapped[Optional["Customer"]] = relationship("Customer", back_populates="tags")
