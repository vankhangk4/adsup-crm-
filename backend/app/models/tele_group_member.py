from typing import Optional, TYPE_CHECKING
from sqlalchemy import Integer, ForeignKey, Boolean, UniqueConstraint
from sqlalchemy.orm import Mapped, mapped_column, relationship
from app.core.database import Base

if TYPE_CHECKING:
    from app.models.tele_group import TeleGroup
    from app.models.user import User


class TeleGroupMember(Base):
    __tablename__ = "tele_group_members"

    __table_args__ = (
        UniqueConstraint("tele_group_id", "user_id", name="uq_tele_group_member"),
    )

    id: Mapped[int] = mapped_column(Integer, primary_key=True, autoincrement=True)
    tele_group_id: Mapped[int] = mapped_column(Integer, ForeignKey("tele_groups.id"), nullable=False)
    user_id: Mapped[int] = mapped_column(Integer, ForeignKey("users.id"), nullable=False)
    is_active: Mapped[bool] = mapped_column(Boolean, default=True, nullable=False)

    tele_group: Mapped[Optional["TeleGroup"]] = relationship("TeleGroup", back_populates="members")
    user: Mapped[Optional["User"]] = relationship("User")
