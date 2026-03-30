import logging
from fastapi import APIRouter, WebSocket, WebSocketDisconnect, Query

from app.core.websocket import ws_manager

logger = logging.getLogger(__name__)
router = APIRouter(tags=["websocket"])


@router.websocket("/ws/chat")
async def websocket_chat(
    websocket: WebSocket,
    conversation_id: int | None = Query(default=None),
):
    """
    WS /ws/chat

    Frontend staff connects to receive real-time message events.

    Query params:
      conversation_id (optional) — subscribe to a specific conversation room.
                                   If omitted, receives ALL new messages.

    Payload pushed to client when a new message arrives:
    {
      "type": "new_message",
      "data": {
        "id": 123,
        "conversation_id": 1,
        "sender_type": "customer",
        "sender_user_id": null,
        "message_text": "Hello",
        "message_type": "text",
        "sent_at": "2026-03-29T10:00:00Z",
        "customer_name": "Nguyen Van A",
        "conversation_status": "open"
      }
    }
    """
    await websocket.accept()

    # If client didn't specify a conversation, they get the global broadcast stream
    sub_conversation_id = conversation_id

    ws_manager.connect(websocket, conversation_id=sub_conversation_id)

    try:
        # Keep the connection alive. Incoming messages from the client are
        # optional (e.g. typing indicators, read receipts). We just wait.
        while True:
            # Use receive_text so we detect disconnects automatically.
            # Client can send optional signals; we just ignore them for now.
            data = await websocket.receive_text()
            logger.debug("WS received from client: %s", data)
    except WebSocketDisconnect:
        pass
    finally:
        ws_manager.disconnect(websocket, conversation_id=sub_conversation_id)
        logger.info("WS client disconnected (conversation=%s)", sub_conversation_id)
