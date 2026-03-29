"""Scripts, permissions, system settings, AI placeholders

Revision ID: 0008
Revises: 0007
Create Date: 2024-01-08 00:00:00.000000
"""
from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op

revision: str = "0008"
down_revision: Union[str, None] = "0007"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # script_categories
    op.create_table(
        "script_categories",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("code", sa.String(100), unique=True, nullable=False),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
    )

    # scripts
    op.create_table(
        "scripts",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("title", sa.String(300), nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("script_type", sa.String(20), nullable=False),
        sa.Column("category_id", sa.Integer, sa.ForeignKey("script_categories.id"), nullable=True),
        sa.Column("service_id", sa.Integer, sa.ForeignKey("services.id"), nullable=True),
        sa.Column("page_id", sa.Integer, sa.ForeignKey("pages.id"), nullable=True),
        sa.Column("tele_group_id", sa.Integer, sa.ForeignKey("tele_groups.id"), nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_by", sa.Integer, nullable=True),
        sa.Column("updated_by", sa.Integer, nullable=True),
    )

    # script_versions
    op.create_table(
        "script_versions",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("script_id", sa.Integer, sa.ForeignKey("scripts.id"), nullable=False),
        sa.Column("version_no", sa.Integer, nullable=False),
        sa.Column("content", sa.Text, nullable=False),
        sa.Column("created_by", sa.Integer, sa.ForeignKey("users.id"), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # user_page_permissions
    op.create_table(
        "user_page_permissions",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("page_id", sa.Integer, sa.ForeignKey("pages.id"), nullable=False),
        sa.Column("can_view", sa.Boolean, default=True, nullable=False),
        sa.Column("can_edit", sa.Boolean, default=False, nullable=False),
    )

    # user_service_permissions
    op.create_table(
        "user_service_permissions",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("service_id", sa.Integer, sa.ForeignKey("services.id"), nullable=False),
        sa.Column("can_view", sa.Boolean, default=True, nullable=False),
        sa.Column("can_edit", sa.Boolean, default=False, nullable=False),
    )

    # system_settings
    op.create_table(
        "system_settings",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("key", sa.String(100), unique=True, nullable=False),
        sa.Column("value", sa.Text, nullable=False),
        sa.Column("description", sa.String(500), nullable=True),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_by", sa.Integer, nullable=True),
    )

    # ai_prompt_templates
    op.create_table(
        "ai_prompt_templates",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("code", sa.String(100), unique=True, nullable=False),
        sa.Column("prompt_text", sa.Text, nullable=False),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
    )

    # ai_action_logs
    op.create_table(
        "ai_action_logs",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("action_name", sa.String(200), nullable=False),
        sa.Column("payload", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # Seed default system settings
    op.execute("""
        INSERT INTO system_settings (key, value, description, updated_at)
        VALUES
        ('duplicate_policy', 'warn', 'Policy when duplicate lead detected', CURRENT_TIMESTAMP),
        ('default_lead_status', 'new', 'Default status for new leads', CURRENT_TIMESTAMP),
        ('enable_auto_routing', 'true', 'Enable automatic lead routing', CURRENT_TIMESTAMP)
    """)


def downgrade() -> None:
    op.drop_table("ai_action_logs")
    op.drop_table("ai_prompt_templates")
    op.drop_table("system_settings")
    op.drop_table("user_service_permissions")
    op.drop_table("user_page_permissions")
    op.drop_table("script_versions")
    op.drop_table("scripts")
    op.drop_table("script_categories")
