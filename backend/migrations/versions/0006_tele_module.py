"""Tele Module: tele_groups, members, service_permissions, lead_assignments, assignment_logs,
call_logs, tele_notes, follow_up_tasks, appointments, tele_status_logs

Revision ID: 0006
Revises: 0005
Create Date: 2024-01-06 00:00:00.000000
"""
from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op

revision: str = "0006"
down_revision: Union[str, None] = "0005"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # tele_groups
    op.create_table(
        "tele_groups",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("code", sa.String(100), unique=True, nullable=False),
        sa.Column("description", sa.String(500), nullable=True),
        sa.Column("max_capacity", sa.Integer, default=20, nullable=False),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_by", sa.Integer, nullable=True),
        sa.Column("updated_by", sa.Integer, nullable=True),
    )

    # tele_group_members
    op.create_table(
        "tele_group_members",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("tele_group_id", sa.Integer, sa.ForeignKey("tele_groups.id"), nullable=False),
        sa.Column("user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.UniqueConstraint("tele_group_id", "user_id", name="uq_tele_group_member"),
    )

    # tele_group_service_permissions
    op.create_table(
        "tele_group_service_permissions",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("tele_group_id", sa.Integer, sa.ForeignKey("tele_groups.id"), nullable=False),
        sa.Column("service_id", sa.Integer, sa.ForeignKey("services.id"), nullable=False),
        sa.UniqueConstraint("tele_group_id", "service_id", name="uq_tele_group_service"),
    )

    # lead_assignments
    op.create_table(
        "lead_assignments",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("lead_id", sa.Integer, sa.ForeignKey("leads.id"), nullable=False),
        sa.Column("assigned_user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=True),
        sa.Column("assigned_group_id", sa.Integer, sa.ForeignKey("tele_groups.id"), nullable=True),
        sa.Column("assignment_type", sa.String(50), default="manual", nullable=False),
        sa.Column("assigned_by", sa.Integer, sa.ForeignKey("users.id"), nullable=True),
        sa.Column("assigned_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
    )

    # assignment_logs
    op.create_table(
        "assignment_logs",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("lead_id", sa.Integer, sa.ForeignKey("leads.id"), nullable=False),
        sa.Column("action", sa.String(100), nullable=False),
        sa.Column("from_user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=True),
        sa.Column("to_user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=True),
        sa.Column("from_group_id", sa.Integer, sa.ForeignKey("tele_groups.id"), nullable=True),
        sa.Column("to_group_id", sa.Integer, sa.ForeignKey("tele_groups.id"), nullable=True),
        sa.Column("note", sa.String(500), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # call_logs
    op.create_table(
        "call_logs",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("lead_id", sa.Integer, sa.ForeignKey("leads.id"), nullable=False),
        sa.Column("tele_user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("call_status", sa.String(50), nullable=False),
        sa.Column("call_result", sa.String(100), nullable=True),
        sa.Column("note", sa.Text, nullable=True),
        sa.Column("called_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # tele_notes
    op.create_table(
        "tele_notes",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("lead_id", sa.Integer, sa.ForeignKey("leads.id"), nullable=False),
        sa.Column("tele_user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("note", sa.Text, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # follow_up_tasks
    op.create_table(
        "follow_up_tasks",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("lead_id", sa.Integer, sa.ForeignKey("leads.id"), nullable=False),
        sa.Column("tele_user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("due_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("status", sa.String(50), default="pending", nullable=False),
        sa.Column("note", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # appointments
    op.create_table(
        "appointments",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("lead_id", sa.Integer, sa.ForeignKey("leads.id"), nullable=False),
        sa.Column("tele_user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("appointment_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("appointment_branch", sa.String(255), nullable=True),
        sa.Column("status", sa.String(50), default="scheduled", nullable=False),
        sa.Column("note", sa.Text, nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
    )

    # tele_status_logs
    op.create_table(
        "tele_status_logs",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("lead_id", sa.Integer, sa.ForeignKey("leads.id"), nullable=False),
        sa.Column("tele_user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("from_status", sa.String(50), nullable=True),
        sa.Column("to_status", sa.String(50), nullable=False),
        sa.Column("changed_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("tele_status_logs")
    op.drop_table("appointments")
    op.drop_table("follow_up_tasks")
    op.drop_table("tele_notes")
    op.drop_table("call_logs")
    op.drop_table("assignment_logs")
    op.drop_table("lead_assignments")
    op.drop_table("tele_group_service_permissions")
    op.drop_table("tele_group_members")
    op.drop_table("tele_groups")
