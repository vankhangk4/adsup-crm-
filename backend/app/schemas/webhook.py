from datetime import datetime
from typing import Optional
from pydantic import BaseModel, Field


# ── Facebook Webhook Verify ──────────────────────────────────────────────────

class FBWebhookVerify(BaseModel):
    """GET /api/webhook/facebook — query params from Facebook"""
    hub_mode: str = Field(alias="hub.mode")
    hub_verify_token: str = Field(alias="hub.verify_token")
    hub_challenge: str = Field(alias="hub.challenge")

    model_config = {"populate_by_name": True}


# ── Facebook Webhook Payload ──────────────────────────────────────────────────

class FBMessageSender(BaseModel):
    id: str


class FBMessageItem(BaseModel):
    mid: str = Field(alias="mid")
    text: Optional[str] = None
    attachments: Optional[list] = None
    quick_reply: Optional[dict] = None
    reply_to: Optional[dict] = None
    is_echo: Optional[bool] = False

    model_config = {"populate_by_name": True}


class FBMessage(BaseModel):
    mid: str = Field(alias="mid", default="")
    text: Optional[str] = None
    attachments: Optional[list] = None
    quick_reply: Optional[dict] = None
    reply_to: Optional[dict] = None
    is_echo: Optional[bool] = False

    model_config = {"populate_by_name": True}


class FBMessaging(BaseModel):
    sender: FBMessageSender
    recipient: FBMessageSender
    timestamp: int
    message: Optional[FBMessage] = None
    delivery: Optional[dict] = None
    read: Optional[dict] = None
    account_linking: Optional[dict] = None
    optin: Optional[dict] = None


class FBEntry(BaseModel):
    id: str
    time: int
    messaging: list[FBMessaging]


class FBWebhookPayload(BaseModel):
    object: str = "page"
    entry: list[FBEntry] = Field(default_factory=list)


# ── Webhook processing result ───────────────────────────────────────────────────

class WebhookProcessingResult(BaseModel):
    """Response schema for webhook POST endpoint"""
    received: bool
    messages_stored: int = 0
    conversations_updated: int = 0
    detail: Optional[str] = None
