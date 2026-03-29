from typing import Optional, TYPE_CHECKING
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.page import Page


class PageAccount(BaseModel):
    __tablename__ = "page_accounts"

    page_id: Mapped[int] = mapped_column(Integer, ForeignKey("pages.id"), nullable=False)
    nick_name: Mapped[str] = mapped_column(String(200), nullable=False)
    nick_type: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    external_account_ref: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    page: Mapped[Optional["Page"]] = relationship("Page", back_populates="page_accounts")
