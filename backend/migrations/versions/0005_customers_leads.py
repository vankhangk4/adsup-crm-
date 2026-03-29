"""Customers, Customer Tags, Lead Sources, Lead Statuses, Leads

Revision ID: 0005
Revises: 0004
Create Date: 2024-01-05 00:00:00.000000
"""
from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op

revision: str = "0005"
down_revision: Union[str, None] = "0004"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # customers
    op.create_table(
        "customers",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("full_name", sa.String(200), nullable=False),
        sa.Column("phone", sa.String(50), nullable=True),
        sa.Column("normalized_phone", sa.String(50), nullable=True),
        sa.Column("email", sa.String(255), nullable=True),
        sa.Column("gender", sa.String(20), nullable=True),
        sa.Column("birth_year", sa.Integer, nullable=True),
        sa.Column("address", sa.String(500), nullable=True),
        sa.Column("note", sa.Text, nullable=True),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_by", sa.Integer, nullable=True),
        sa.Column("updated_by", sa.Integer, nullable=True),
    )
    op.create_index("ix_customers_normalized_phone", "customers", ["normalized_phone"])

    # customer_tags
    op.create_table(
        "customer_tags",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("customer_id", sa.Integer, sa.ForeignKey("customers.id"), nullable=False),
        sa.Column("tag_name", sa.String(100), nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
    )

    # lead_sources
    op.create_table(
        "lead_sources",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("code", sa.String(100), unique=True, nullable=False),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_by", sa.Integer, nullable=True),
        sa.Column("updated_by", sa.Integer, nullable=True),
    )

    # lead_statuses
    op.create_table(
        "lead_statuses",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("name", sa.String(200), nullable=False),
        sa.Column("code", sa.String(100), unique=True, nullable=False),
        sa.Column("sort_order", sa.Integer, default=0, nullable=False),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("display_name", sa.String(200), nullable=True),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_by", sa.Integer, nullable=True),
        sa.Column("updated_by", sa.Integer, nullable=True),
    )

    # leads
    op.create_table(
        "leads",
        sa.Column("id", sa.Integer, primary_key=True, autoincrement=True),
        sa.Column("customer_id", sa.Integer, sa.ForeignKey("customers.id"), nullable=False),
        sa.Column("conversation_id", sa.Integer, sa.ForeignKey("conversations.id"), nullable=True),
        sa.Column("page_id", sa.Integer, sa.ForeignKey("pages.id"), nullable=True),
        sa.Column("page_user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=True),
        sa.Column("tele_user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=True),
        sa.Column("tele_group_id", sa.Integer, nullable=True),
        sa.Column("marketing_user_id", sa.Integer, sa.ForeignKey("users.id"), nullable=True),
        sa.Column("service_id", sa.Integer, sa.ForeignKey("services.id"), nullable=False),
        sa.Column("source_id", sa.Integer, sa.ForeignKey("lead_sources.id"), nullable=True),
        sa.Column("campaign_name", sa.String(255), nullable=True),
        sa.Column("ad_name", sa.String(255), nullable=True),
        sa.Column("lead_status_code", sa.String(50), default="new", nullable=False),
        sa.Column("interest_level", sa.String(20), nullable=True),
        sa.Column("note_page", sa.Text, nullable=True),
        sa.Column("note_tele", sa.Text, nullable=True),
        sa.Column("booked_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("visited_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("closed_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("revenue", sa.Float, nullable=True),
        sa.Column("is_duplicate", sa.Boolean, default=False, nullable=False),
        sa.Column("deleted_at", sa.DateTime(timezone=True), nullable=True),
        sa.Column("is_active", sa.Boolean, default=True, nullable=False),
        sa.Column("created_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("updated_at", sa.DateTime(timezone=True), nullable=False),
        sa.Column("created_by", sa.Integer, nullable=True),
        sa.Column("updated_by", sa.Integer, nullable=True),
    )
    op.create_index("ix_leads_customer_id", "leads", ["customer_id"])
    op.create_index("ix_leads_service_id", "leads", ["service_id"])
    op.create_index("ix_leads_page_id", "leads", ["page_id"])
    op.create_index("ix_leads_tele_user_id", "leads", ["tele_user_id"])
    op.create_index("ix_leads_tele_group_id", "leads", ["tele_group_id"])
    op.create_index("ix_leads_lead_status_code", "leads", ["lead_status_code"])
    op.create_index("ix_leads_created_at", "leads", ["created_at"])

    # Seed lead_statuses
    op.execute("""
        INSERT INTO lead_statuses (name, code, sort_order, is_active, display_name, created_at, updated_at)
        VALUES
        ('Mới', 'new', 1, 1, 'Mới', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('Tiềm năng', 'qualified', 2, 1, 'Tiềm năng', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('Đã phân công', 'assigned', 3, 1, 'Đã phân công', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('Đã liên hệ', 'contacted', 4, 1, 'Đã liên hệ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('Đang xử lý', 'follow_up', 5, 1, 'Đang xử lý', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('Đã hẹn', 'booked', 6, 1, 'Đã hẹn', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('Đã ghé thăm', 'visited', 7, 1, 'Đã ghé thăm', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('Thành công', 'won', 8, 1, 'Thành công', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('Từ chối', 'lost', 9, 1, 'Từ chối', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('Trùng lặp', 'duplicate', 10, 1, 'Trùng lặp', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP),
        ('Lưu trữ', 'archived', 11, 1, 'Lưu trữ', CURRENT_TIMESTAMP, CURRENT_TIMESTAMP)
    """)


def downgrade() -> None:
    op.drop_index("ix_leads_created_at", table_name="leads")
    op.drop_index("ix_leads_lead_status_code", table_name="leads")
    op.drop_index("ix_leads_tele_group_id", table_name="leads")
    op.drop_index("ix_leads_tele_user_id", table_name="leads")
    op.drop_index("ix_leads_page_id", table_name="leads")
    op.drop_index("ix_leads_service_id", table_name="leads")
    op.drop_index("ix_leads_customer_id", table_name="leads")
    op.drop_table("leads")
    op.drop_table("lead_statuses")
    op.drop_table("lead_sources")
    op.drop_table("customer_tags")
    op.drop_index("ix_customers_normalized_phone", table_name="customers")
    op.drop_table("customers")
