"""Facebook webhook setup — channels FB fields, conversations channel_id, seed data

Revision ID: 0009
Revises: 0008
Create Date: 2026-03-29 00:00:00.000000
"""
from typing import Sequence, Union
import sqlalchemy as sa
from alembic import op
from sqlalchemy import text

revision: str = "0009"
down_revision: Union[str, None] = "0008"
branch_labels: Union[str, Sequence[str], None] = None
depends_on: Union[str, Sequence[str], None] = None


def upgrade() -> None:
    # ── channels: thêm Facebook fields ───────────────────────────────────────
    op.add_column("channels", sa.Column("fb_app_id", sa.String(100), nullable=True))
    op.add_column("channels", sa.Column("fb_app_secret", sa.String(255), nullable=True))
    op.add_column("channels", sa.Column("fb_verify_token", sa.String(255), nullable=True))

    # ── conversations: thêm channel_id (nullable, FK enforced by ORM) ───────
    op.add_column("conversations", sa.Column("channel_id", sa.Integer, nullable=True))

    # Thêm index cho composite query (channel + external_customer_id)
    op.create_index(
        "ix_conversations_channel_external",
        "conversations",
        ["channel_id", "external_customer_id"],
        if_not_exists=True,
    )

    # ── Seed Facebook channel + Page ──────────────────────────────────────────
    # FB_PAGE_ID được set từ env khi chạy, ở đây seed channel facebook
    op.execute("""
        INSERT OR IGNORE INTO channels (name, code, description, fb_app_id, fb_verify_token, created_at, updated_at, is_active)
        VALUES ('Facebook', 'facebook', 'Kênh Facebook Messenger', NULL, NULL, CURRENT_TIMESTAMP, CURRENT_TIMESTAMP, 1)
    """)


def downgrade() -> None:
    op.drop_index("ix_conversations_channel_external", table_name="conversations")
    op.drop_column("conversations", "channel_id")
    op.drop_column("channels", "fb_verify_token")
    op.drop_column("channels", "fb_app_secret")
    op.drop_column("channels", "fb_app_id")
