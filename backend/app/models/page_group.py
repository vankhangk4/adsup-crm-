from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey, UniqueConstraint, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base
from app.models.base import BaseModel, utcnow
from datetime import datetime

if TYPE_CHECKING:
    from app.models.page import Page


class PageGroup(Base):
    __tablename__ = "page_groups"

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)
    created_at: Mapped[datetime] = mapped_column(default=utcnow, nullable=False)
    updated_at: Mapped[datetime] = mapped_column(default=utcnow, onupdate=utcnow, nullable=False)

    # Relationships
    members: Mapped[List["PageGroupMember"]] = relationship("PageGroupMember", back_populates="page_group", cascade="all, delete-orphan")


class PageGroupMember(Base):
    __tablename__ = "page_group_members"

    __table_args__ = (
        UniqueConstraint("page_group_id", "page_id", name="uq_page_group_member"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    page_group_id: Mapped[int] = mapped_column(Integer, ForeignKey("page_groups.id"), nullable=False)
    page_id: Mapped[int] = mapped_column(Integer, ForeignKey("pages.id"), nullable=False)

    # Relationships
    page_group: Mapped["PageGroup"] = relationship("PageGroup", back_populates="members")
    page: Mapped[Optional["Page"]] = relationship("Page")
