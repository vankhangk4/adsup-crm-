"""Conversations, Messages, Conversation Tags, Assignments, Customer Profiles Raw

Revision ID: 0004
Revises: 0003
Create Date: 2024-01-04 00:00:00.000000
"""
from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op

revision: str = "0004"
down_revision: Union[str, None] = "0003"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # conversations
    op.create_table(
        "conversations",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("page_id", sa.Integer, sa.ForeignKey("pages.id"), nullable=False),
        sa.Column("page_account_id", sa.Integer, sa.ForeignKey("page_accounts.id"), nullable=True),
        sa.Column("external_customer_id", sa.String(255), nullable=True),
        sa.Column("customer_name", sa.String(200), nullable=True),
        sa.Column("customer_avatar", sa.String(500), nullable=True),
        sa.Column("assigned_page_user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=True),
        sa.Column("conversation_status", sa.String(50), default="open", nullable=False),
        sa.Column("last_message", sa.Text, nullable=True),
        sa.Column("last_message_time", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_hot", sa.Boolean, default=False, nullable=False),
        sa.Column("phone_collected", sa.Boolean, default=False, nullable=False),
        sa.Column("collected_phone", sa.String(50), nullable=True),
        sa.Column("waiting_for_tele", sa.Boolean, default=False, nullable=False),
        sa.Column("internal_note", sa.Text, nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_by", sa.Integer, nullable=True),
        sa.Column("updated_by", sa.Integer, nullable=True),
    )
    op.create_index("ix_conversations_page_id", "conversations", ["page_id"])
    op.create_index("ix_conversations_assigned_page_user_id", "conversations", ["assigned_page_user_id"])
    op.create_index("ix_conversations_status", "conversations", ["conversation_status"])
    op.create_index("ix_conversations_last_message_time", "conversations", ["last_message_time"])

    # messages
    op.create_table(
        "messages",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("conversation_id", sa.Integer, sa.ForeignKey("conversations.id"), nullable=False),
        sa.Column("sender_type", sa.String(50), nullable=False),
        sa.Column("sender_user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=True),
        sa.Column("message_text", sa.Text, nullable=False),
        sa.Column("message_type", sa.String(50), default="text", nullable=False),
        sa.Column("sent_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_by", sa.Integer, nullable=True),
        sa.Column("updated_by", sa.Integer, nullable=True),
    )

    # conversation_tags
    op.create_table(
        "conversation_tags",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("conversation_id", sa.Integer, sa.ForeignKey("conversations.id"), nullable=False),
        sa.Column("tag_name", sa.String(100), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # conversation_assignments
    op.create_table(
        "conversation_assignments",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("conversation_id", sa.Integer, sa.ForeignKey("conversations.id"), nullable=False),
        sa.Column("assigned_user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=False),
        sa.Column("assigned_by", sa.Integer, sa.ForeignKey("users.id"), nullable=True),
        sa.Column("assigned_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
    )

    # customer_profiles_raw
    op.create_table(
        "customer_profiles_raw",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("conversation_id", sa.Integer, sa.ForeignKey("conversations.id"), nullable=False),
        sa.Column("raw_payload", sa.Text, nullable=False),
        sa.Column("source", sa.String(100), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )


def downgrade() -> None:
    op.drop_table("customer_profiles_raw")
    op.drop_table("conversation_assignments")
    op.drop_table("conversation_tags")
    op.drop_table("messages")
    op.drop_index("ix_conversations_last_message_time", table_name="conversations")
    op.drop_index("ix_conversations_status", table_name="conversations")
    op.drop_index("ix_conversations_assigned_page_user_id", table_name="conversations")
    op.drop_index("ix_conversations_page_id", table_name="conversations")
    op.drop_table("conversations")
