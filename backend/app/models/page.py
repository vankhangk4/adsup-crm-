from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.channel import Channel
    from app.models.page_account import PageAccount
    from app.models.page_user_assignment import PageUserAssignment


class Page(BaseModel):
    __tablename__ = "pages"

    channel_id: Mapped[int] = mapped_column(Integer, ForeignKey("channels.id"), nullable=False)
    page_name: Mapped[str] = mapped_column(String(200), nullable=False)
    page_code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    page_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    page_status: Mapped[str] = mapped_column(String(50), default="active", nullable=False)
    external_page_ref: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    channel: Mapped[Optional["Channel"]] = relationship("Channel", foreign_keys=[channel_id])
    page_accounts: Mapped[List["PageAccount"]] = relationship("PageAccount", back_populates="page")
    user_assignments: Mapped[List["PageUserAssignment"]] = relationship("PageUserAssignment", back_populates="page")
