from typing import Optional, TYPE_CHECKING
from sqlalchemy import Integer, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import utcnow
from datetime import datetime

if TYPE_CHECKING:
    from app.models.page import Page
    from app.models.user import User


class PageUserAssignment(Base):
    __tablename__ = "page_user_assignments"

    __table_args__ = (
        UniqueConstraint("page_id", "user_id", name="uq_page_user_assignment"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    page_id: Mapped[int] = mapped_column(Integer, ForeignKey("pages.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    page: Mapped[Optional["Page"]] = relationship("Page", back_populates="user_assignments")
    user: Mapped[Optional["User"]] = relationship("User")
