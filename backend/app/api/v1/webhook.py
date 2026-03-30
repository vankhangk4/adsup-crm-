import logging
from datetime import datetime, timezone
from fastapi import APIRouter, Query, HTTPException, Depends
from sqlalchemy import select, and_
from sqlalchemy.ext.asyncio import AsyncSession
import httpx

from app.core.async_database import get_async_db
from app.core.config import settings
from app.core.response import success_response
from app.core.websocket import ws_manager
from app.schemas.webhook import (
    FBWebhookPayload,
    FBMessaging,
    WebhookProcessingResult,
)

logger = logging.getLogger(__name__)
router = APIRouter(prefix="/webhook", tags=["webhooks"])


# ── Helpers ─────────────────────────────────────────────────────────────────────

def _from_timestamp(ts: int) -> datetime:
    # Facebook sends seconds (e.g. 1743350400); some platforms send milliseconds
    return datetime.fromtimestamp(ts / 1000 if ts > 1e12 else ts, tz=timezone.utc)


async def _resolve_page(session: AsyncSession, fb_page_id: str) -> tuple[int | None, int | None, str | None]:
    """
    Look up internal page by external_page_ref.
    If not found and matches FB_PAGE_ID from config, auto-create page + channel.
    Returns (page_id, channel_id, channel_code).
    """
    from sqlalchemy.orm import joinedload
    from app.models.page import Page
    from app.models.channel import Channel

    stmt = (
        select(Page)
        .options(joinedload(Page.channel))
        .where(Page.external_page_ref == fb_page_id)
    )
    result = await session.execute(stmt)
    page = result.scalar_one_or_none()

    if page is not None:
        channel_code = page.channel.code if page.channel else None
        return page.id, page.channel_id, channel_code

    # Auto-create if matches configured FB_PAGE_ID
    configured_page_id = getattr(settings, "FB_PAGE_ID", None)
    if not configured_page_id or fb_page_id != str(configured_page_id):
        logger.warning("FB Page ID %s not registered and doesn't match config — skipping", fb_page_id)
        return None, None, None

    logger.info("Auto-creating channel + page for FB Page ID: %s", fb_page_id)

    # Create channel facebook if not exists
    channel_stmt = select(Channel).where(Channel.code == "facebook")
    channel_result = await session.execute(channel_stmt)
    channel = channel_result.scalar_one_or_none()

    if not channel:
        channel = Channel(
            name="Facebook",
            code="facebook",
            description="Kênh Facebook Messenger",
            fb_app_id=getattr(settings, "FB_APP_ID", None),
            fb_verify_token=getattr(settings, "FB_VERIFY_TOKEN", None),
        )
        session.add(channel)
        await session.flush()
        logger.info("Created channel id=%s code=facebook", channel.id)
    else:
        logger.info("Using existing channel id=%s code=facebook", channel.id)

    # Create page
    page = Page(
        channel_id=channel.id,
        page_name=f"FB Page {fb_page_id}",
        page_code=f"PAGE_{fb_page_id[-8:]}",
        external_page_ref=fb_page_id,
        page_status="active",
    )
    session.add(page)
    await session.flush()
    logger.info("Created page id=%s external_ref=%s", page.id, fb_page_id)

    return page.id, page.channel_id, "facebook"


async def _find_or_create_customer(
    session: AsyncSession, channel_id: int, psid: str, sender_name: str | None
):
    from app.models.customer import Customer

    stmt = select(Customer).where(
        and_(
            Customer.channel_id == channel_id,
            Customer.external_customer_id == psid,
            Customer.is_active == True,
        )
    )
    result = await session.execute(stmt)
    customer = result.scalar_one_or_none()

    if customer:
        return customer

    name = sender_name or f"FB_{psid}"
    customer = Customer(
        full_name=name,
        channel_id=channel_id,
        external_customer_id=psid,
    )
    session.add(customer)
    return customer


async def _find_or_create_conversation(
    session: AsyncSession,
    page_id: int,
    channel_id: int,
    psid: str,
    sender_name: str | None,
):
    from app.models.conversation import Conversation

    stmt = select(Conversation).where(
        and_(
            Conversation.page_id == page_id,
            Conversation.external_customer_id == psid,
            Conversation.is_active == True,
            Conversation.conversation_status == "open",
        )
    )
    result = await session.execute(stmt)
    conv = result.scalar_one_or_none()

    if conv:
        return conv

    conv = Conversation(
        page_id=page_id,
        channel_id=channel_id,
        external_customer_id=psid,
        customer_name=sender_name or f"FB_{psid}",
        conversation_status="open",
    )
    session.add(conv)
    return conv


async def _process_messaging_event(
    session: AsyncSession, page_id: int, channel_id: int, channel_code: str | None, event: FBMessaging
) -> dict | None:
    sender_psid = event.sender.id
    sent_at = _from_timestamp(event.timestamp)

    # Ignore echoes
    if event.message and getattr(event.message, "is_echo", False):
        return None

    if not event.message or not event.message.text:
        return None

    text = event.message.text

    customer = await _find_or_create_customer(session, channel_id, sender_psid, None)
    await session.flush()

    conversation = await _find_or_create_conversation(
        session, page_id, channel_id, sender_psid, None
    )
    await session.flush()

    # Persist the incoming message
    from app.models.message import Message

    msg = Message(
        conversation_id=conversation.id,
        sender_type="customer",
        message_text=text,
        message_type="text",
        sent_at=sent_at,
    )
    session.add(msg)
    await session.flush()

    # Keep conversation preview in sync
    conversation.last_message = text
    conversation.last_message_time = sent_at

    # Build broadcast payload
    broadcast_payload = {
        "type": "new_message",
        "data": {
            "id": msg.id,
            "conversation_id": conversation.id,
            "page_id": page_id,
            "channel_id": channel_id,
            "channel_code": channel_code,
            "sender_type": "customer",
            "sender_user_id": None,
            "message_text": text,
            "message_type": "text",
            "sent_at": sent_at.isoformat(),
            "external_customer_id": sender_psid,
            "customer_name": conversation.customer_name,
            "conversation_status": conversation.conversation_status,
        },
    }
    return broadcast_payload


# ── Endpoints ───────────────────────────────────────────────────────────────────

@router.get("/facebook")
async def verify_facebook_webhook(
    hub_mode: str = Query(alias="hub.mode"),
    hub_verify_token: str = Query(alias="hub.verify_token"),
    hub_challenge: str = Query(alias="hub.challenge"),
):
    if hub_mode != "subscribe":
        raise HTTPException(status_code=404, detail="Unknown hub.mode")

    expected_token = getattr(settings, "FB_VERIFY_TOKEN", None)
    if expected_token and hub_verify_token != expected_token:
        raise HTTPException(status_code=403, detail="Invalid verify token")

    from fastapi.responses import PlainTextResponse
    return PlainTextResponse(content=hub_challenge, status_code=200)


@router.post("/facebook")
async def handle_facebook_webhook(
    payload: FBWebhookPayload,
    session: AsyncSession = Depends(get_async_db),
):
    if payload.object != "page":
        return success_response(
            data=WebhookProcessingResult(received=True, messages_stored=0, detail="Ignored").model_dump()
        )

    ws_broadcasts: list[dict] = []

    for entry in payload.entry:
        page_id, channel_id, channel_code = await _resolve_page(session, entry.id)
        if page_id is None:
            logger.warning("FB Page ID %s not registered — skipping entry", entry.id)
            continue

        for event in entry.messaging:
            result = await _process_messaging_event(session, page_id, channel_id, channel_code, event)
            if result:
                ws_broadcasts.append(result)

    await session.commit()

    # Broadcast to all WebSocket clients
    for payload_ws in ws_broadcasts:
        await ws_manager.broadcast_all(payload_ws)

    return success_response(
        data=WebhookProcessingResult(
            received=True,
            messages_stored=len(ws_broadcasts),
        ).model_dump(),
    )


@router.get("/page-id")
async def get_facebook_page_id(
    url: str = Query(None, description="Facebook Page URL hoặc username"),
    page_id: str = Query(None, description="Facebook Page ID numeric"),
):
    identifier = None

    if page_id:
        identifier = page_id.strip()
    elif url:
        raw = url.strip().rstrip('/')
        if raw.startswith('http'):
            parts = raw.rsplit('/', 1)
            identifier = parts[-1].split('?')[0]
        else:
            identifier = raw.split('?')[0]

    if not identifier:
        raise HTTPException(status_code=400, detail="Cần cung cấp url hoặc page_id")

    fb_api_url = f"https://graph.facebook.com/v18.0/{identifier}"

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(fb_api_url, params={"fields": "id,name"})

        if response.status_code == 404:
            raise HTTPException(status_code=404, detail=f"Không tìm thấy Page '{identifier}'.")

        if response.status_code != 200:
            raise HTTPException(status_code=502, detail="Facebook API trả lỗi.")

        data = response.json()
        if "id" not in data:
            raise HTTPException(status_code=404, detail="Không lấy được Page.")

        resolved_id = data["id"]
        page_name = data.get("name", "")

        return success_response(
            data={
                "page_id": resolved_id,
                "page_name": page_name,
                "url": f"https://www.facebook.com/{resolved_id}",
            },
            message="OK"
        )

    except httpx.TimeoutException:
        raise HTTPException(status_code=504, detail="Facebook API timeout.")
    except httpx.RequestError as e:
        raise HTTPException(status_code=502, detail=f"Lỗi kết nối Facebook.")
