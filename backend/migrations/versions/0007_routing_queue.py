"""Routing rules and lead queues

Revision ID: 0007
Revises: 0006
Create Date: 2024-01-07 00:00:00.000000
"""
from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op

revision: str = "0007"
down_revision: Union[str, None] = "0006"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # routing_rules
    op.create_table(
        "routing_rules",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("priority", sa.Integer, default=0, nullable=False),
        sa.Column("page_id", sa.Integer, sa.ForeignKey("pages.id"), nullable=True),
        sa.Column("service_id", sa.Integer, sa.ForeignKey("services.id"), nullable=True),
        sa.Column("target_group_id", sa.Integer, sa.ForeignKey("tele_groups.id"), nullable=True),
        sa.Column("assignment_strategy", sa.String(50), default="direct_group", nullable=False),
        sa.Column("match_source_code", sa.String(100), nullable=True),
        sa.Column("match_time_from", sa.String(10), nullable=True),
        sa.Column("match_time_to", sa.String(10), nullable=True),
        sa.Column("match_province", sa.String(100), nullable=True),
        sa.Column("match_priority", sa.String(20), nullable=True),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_by", sa.Integer, nullable=True),
        sa.Column("updated_by", sa.Integer, nullable=True),
    )

    # lead_queues
    op.create_table(
        "lead_queues",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("lead_id", sa.Integer, sa.ForeignKey("leads.id"), nullable=False),
        sa.Column("queue_reason", sa.String(50), nullable=False),
        sa.Column("status", sa.String(20), default="pending", nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("released_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("released_by", sa.Integer, sa.ForeignKey("users.id"), nullable=True),
    )


def downgrade() -> None:
    op.drop_table("lead_queues")
    op.drop_table("routing_rules")
