"""
Facebook Messenger Sender — gửi tin nhắn từ CRM sang Facebook.
"""
import logging
import httpx
from app.core.config import settings

logger = logging.getLogger(__name__)

FB_GRAPH_URL = "https://graph.facebook.com/v18.0"


async def send_text_message(recipient_psid: str, text: str) -> dict:
    """
    Gửi tin nhắn text tới người nhận trên Facebook Messenger.

    Args:
        recipient_psid: Facebook PSID (sender ID từ webhook payload)
        text: Nội dung tin nhắn

    Returns:
        dict với response từ Facebook API
    """
    if not settings.FB_PAGE_ACCESS_TOKEN:
        raise RuntimeError("FB_PAGE_ACCESS_TOKEN chưa được cấu hình")

    url = f"{FB_GRAPH_URL}/me/messages"
    params = {"access_token": settings.FB_PAGE_ACCESS_TOKEN}
    payload = {
        "recipient": {"id": recipient_psid},
        "message": {"text": text},
    }

    try:
        async with httpx.AsyncClient(timeout=30.0) as client:
            response = await client.post(url, params=params, json=payload)

        if response.status_code != 200:
            logger.error("FB send message failed: %s %s", response.status_code, response.text)
            raise httpx.HTTPStatusError(
                f"Facebook API error: {response.status_code}",
                request=response.request,
                response=response,
            )

        data = response.json()
        logger.info(
            "FB message sent to PSID=%s mid=%s",
            recipient_psid,
            data.get("message_id"),
        )
        return data

    except httpx.TimeoutException:
        logger.error("FB API timeout when sending to PSID=%s", recipient_psid)
        raise
    except httpx.RequestError as e:
        logger.error("FB API request error: %s", e)
        raise


async def send_typing_on(recipient_psid: str) -> dict:
    """Gửi tín hiệu typing indicator (3 chấm) tới người nhận."""
    if not settings.FB_PAGE_ACCESS_TOKEN:
        return {}

    url = f"{FB_GRAPH_URL}/me/messages"
    params = {"access_token": settings.FB_PAGE_ACCESS_TOKEN}
    payload = {
        "recipient": {"id": recipient_psid},
        "sender_action": "typing_on",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, params=params, json=payload)
        return response.json() if response.status_code == 200 else {}
    except Exception:
        return {}


async def mark_seen(recipient_psid: str) -> dict:
    """Gửi tín hiệu mark_as_read tới người nhận."""
    if not settings.FB_PAGE_ACCESS_TOKEN:
        return {}

    url = f"{FB_GRAPH_URL}/me/messages"
    params = {"access_token": settings.FB_PAGE_ACCESS_TOKEN}
    payload = {
        "recipient": {"id": recipient_psid},
        "sender_action": "mark_seen",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(url, params=params, json=payload)
        return response.json() if response.status_code == 200 else {}
    except Exception:
        return {}


async def get_user_profile(psid: str) -> dict:
    """
    Lấy thông tin user profile từ Facebook (tên, avatar).

    Args:
        psid: Facebook PSID

    Returns:
        dict với name, profile_pic, locale, timezone, gender
    """
    if not settings.FB_PAGE_ACCESS_TOKEN:
        raise RuntimeError("FB_PAGE_ACCESS_TOKEN chưa được cấu hình")

    url = f"{FB_GRAPH_URL}/{psid}"
    params = {
        "access_token": settings.FB_PAGE_ACCESS_TOKEN,
        "fields": "name,profile_pic,locale,timezone,gender",
    }

    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.get(url, params=params)

        if response.status_code != 200:
            logger.warning("FB get profile failed for PSID=%s: %s", psid, response.text)
            return {}

        return response.json()

    except Exception as e:
        logger.warning("FB get profile error for PSID=%s: %s", psid, e)
        return {}
