from typing import Optional, TYPE_CHECKING
from sqlalchemy import String
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.page import Page


class Channel(BaseModel):
    __tablename__ = "channels"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)

    # Facebook-specific fields
    fb_app_id: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    fb_app_secret: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)
    fb_verify_token: Mapped[Optional[str]] = mapped_column(String(255), nullable=True)

    # Relationships
    pages: Mapped[list["Page"]] = relationship("Page", back_populates="channel")
