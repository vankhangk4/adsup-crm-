"""Services, Channels, Pages, Page Accounts, Page Groups, Page User Assignments

Revision ID: 0003
Revises: 0002
Create Date: 2024-01-03 00:00:00.000000
"""
from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op

revision: str = "0003"
down_revision: Union[str, None] = "0002"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # services
    op.create_table(
        "services",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(200), unique=True, nullable=False),
        sa.Column("code", sa.String(100), unique=True, nullable=False),
        sa.Column("description", sa.String(500), nullable=True),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_by", sa.Integer, nullable=True),
        sa.Column("updated_by", sa.Integer, nullable=True),
    )

    # channels
    op.create_table(
        "channels",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("code", sa.String(100), unique=True, nullable=False),
        sa.Column("description", sa.String(500), nullable=True),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_by", sa.Integer, nullable=True),
        sa.Column("updated_by", sa.Integer, nullable=True),
    )

    # pages
    op.create_table(
        "pages",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("channel_id", sa.Integer, sa.ForeignKey("channels.id"), nullable=False),
        sa.Column("page_name", sa.String(200), nullable=False),
        sa.Column("page_code", sa.String(100), unique=True, nullable=False),
        sa.Column("page_type", sa.String(100), nullable=True),
        sa.Column("page_status", sa.String(50), default="active", nullable=False),
        sa.Column("external_page_ref", sa.String(255), nullable=True),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_by", sa.Integer, nullable=True),
        sa.Column("updated_by", sa.Integer, nullable=True),
    )

    # page_accounts
    op.create_table(
        "page_accounts",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("page_id", sa.Integer, sa.ForeignKey("pages.id"), nullable=False),
        sa.Column("nick_name", sa.String(200), nullable=False),
        sa.Column("nick_type", sa.String(100), nullable=True),
        sa.Column("external_account_ref", sa.String(255), nullable=True),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_by", sa.Integer, nullable=True),
        sa.Column("updated_by", sa.Integer, nullable=True),
    )

    # page_groups
    op.create_table(
        "page_groups",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("code", sa.String(100), unique=True, nullable=False),
        sa.Column("description", sa.String(500), nullable=True),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # page_group_members
    op.create_table(
        "page_group_members",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("page_group_id", sa.Integer, sa.ForeignKey("page_groups.id"), nullable=False),
        sa.Column("page_id", sa.Integer, sa.ForeignKey("pages.id"), nullable=False),
        sa.UniqueConstraint("page_group_id", "page_id", name="uq_page_group_member"),
    )

    # page_user_assignments
    op.create_table(
        "page_user_assignments",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("page_id", sa.Integer, sa.ForeignKey("pages.id"), nullable=False),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.UniqueConstraint("page_id", "user_id", name="uq_page_user_assignment"),
    )


def downgrade() -> None:
    op.drop_table("page_user_assignments")
    op.drop_table("page_group_members")
    op.drop_table("page_groups")
    op.drop_table("page_accounts")
    op.drop_table("pages")
    op.drop_table("channels")
    op.drop_table("services")
