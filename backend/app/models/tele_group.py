from typing import Optional, List, TYPE_CHECKING
from sqlalchemy import String, Integer, Boolean
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.models.base import BaseModel

if TYPE_CHECKING:
    from app.models.tele_group_member import TeleGroupMember
    from app.models.tele_group_service_permission import TeleGroupServicePermission


class TeleGroup(BaseModel):
    __tablename__ = "tele_groups"

    name: Mapped[str] = mapped_column(String(200), nullable=False)
    code: Mapped[str] = mapped_column(String(100), unique=True, nullable=False)
    description: Mapped[Optional[str]] = mapped_column(String(500), nullable=True)
    max_capacity: Mapped[int] = mapped_column(Integer, default=20, nullable=False)

    members: Mapped[List["TeleGroupMember"]] = relationship("TeleGroupMember", back_populates="tele_group", cascade="all, delete-orphan")
    service_permissions: Mapped[List["TeleGroupServicePermission"]] = relationship("TeleGroupServicePermission", back_populates="tele_group", cascade="all, delete-orphan")
