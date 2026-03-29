from typing import Optional, TYPE_CHECKING
from sqlalchemy import Integer, ForeignKey, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.tele_group import TeleGroup
    from app.models.service import Service


class TeleGroupServicePermission(Base):
    __tablename__ = "tele_group_service_permissions"

    __table_args__ = (
        UniqueConstraint("tele_group_id", "service_id", name="uq_tele_group_service"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tele_group_id: Mapped[int] = mapped_column(Integer, ForeignKey("tele_groups.id"), nullable=False)
    service_id: Mapped[int] = mapped_column(Integer, ForeignKey("services.id"), nullable=False)

    tele_group: Mapped[Optional["TeleGroup"]] = relationship("TeleGroup", back_populates="service_permissions")
    service: Mapped[Optional["Service"]] = relationship("Service")
