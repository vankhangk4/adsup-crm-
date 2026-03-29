from typing import Optional
from sqlalchemy import String, Integer, Text, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import BaseModel, SoftDeleteMixin


class Script(SoftDeleteMixin, BaseModel):
    __tablename__ = "scripts"

    title: Mapped[str] = mapped_column(String(300), nullable=False)
    content: Mapped[str] = mapped_column(Text, nullable=False)
    script_type: Mapped[str] = mapped_column(String(20), nullable=False)  # page/tele/both
    category_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("script_categories.id"), nullable=True)
    service_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("services.id"), nullable=True)
    page_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("pages.id"), nullable=True)
    tele_group_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("tele_groups.id"), nullable=True)
