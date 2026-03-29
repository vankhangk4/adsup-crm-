from typing import Optional
from sqlalchemy import String, Integer, ForeignKey
from sqlalchemy.orm import Mapped, mapped_column
from app.models.base import BaseModel


class RoutingRule(BaseModel):
    __tablename__ = "routing_rules"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    priority: Mapped[int] = mapped_column(Integer, default=0, nullable=False)
    page_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("pages.id"), nullable=True)
    service_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("services.id"), nullable=True)
    target_group_id: Mapped[Optional[int]] = mapped_column(Integer, ForeignKey("tele_groups.id"), nullable=True)
    # direct_group / round_robin
    assignment_strategy: Mapped[str] = mapped_column(String(50), default="direct_group", nullable=False)
    # Extended match conditions (B121)
    match_source_code: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    match_time_from: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)   # HH:MM
    match_time_to: Mapped[Optional[str]] = mapped_column(String(10), nullable=True)     # HH:MM
    match_province: Mapped[Optional[str]] = mapped_column(String(100), nullable=True)
    match_priority: Mapped[Optional[str]] = mapped_column(String(20), nullable=True)    # high/medium/low
