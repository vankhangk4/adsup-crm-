import logging
import json
from typing import Any
from fastapi import WebSocket

logger = logging.getLogger(__name__)


class ConnectionManager:
    """
    Manages active WebSocket connections from frontend staff.

    Architecture:
      - connections: dict[conversation_id, set[WebSocket]]   — per-conversation room
      - all_connections: set[WebSocket]                       — every open socket

    Broadcast scope:
      - broadcast_to_conversation(id, payload) → all staff watching that conversation
      - broadcast_all(payload)                  → every open connection (e.g. inbox refresh)
    """

    def __init__(self) -> None:
        self._connections: dict[int, set[WebSocket]] = {}
        self._all_connections: set[WebSocket] = set()

    # ── connection lifecycle ──────────────────────────────────────────────────

    def connect(self, websocket: WebSocket, conversation_id: int | None = None) -> None:
        """Accept a new WebSocket and optionally join a conversation room."""
        self._all_connections.add(websocket)
        if conversation_id is not None:
            room = self._connections.setdefault(conversation_id, set())
            room.add(websocket)
        logger.debug(
            "WS connected (total=%d, room=%s)",
            len(self._all_connections),
            conversation_id,
        )

    def disconnect(self, websocket: WebSocket, conversation_id: int | None = None) -> None:
        """Remove a WebSocket. Cleans up both the global pool and the room if provided."""
        self._all_connections.discard(websocket)
        if conversation_id is not None:
            room = self._connections.get(conversation_id)
            if room:
                room.discard(websocket)
                if not room:
                    del self._connections[conversation_id]
        logger.debug(
            "WS disconnected (total=%d, room=%s)",
            len(self._all_connections),
            conversation_id,
        )

    # ── broadcast helpers ────────────────────────────────────────────────────

    async def _send_json(self, websocket: WebSocket, payload: Any) -> bool:
        """Send payload as JSON. Returns True on success, False if socket was closed."""
        try:
            await websocket.send_json(payload)
            return True
        except Exception:
            return False

    async def broadcast_to_conversation(
        self, conversation_id: int, payload: Any
    ) -> int:
        """
        Push payload to every WebSocket subscribed to this conversation.
        Returns the number of clients successfully notified.
        """
        room = self._connections.get(conversation_id, set())
        if not room:
            return 0

        dead: set[WebSocket] = set()
        count = 0

        for ws in room:
            if await self._send_json(ws, payload):
                count += 1
            else:
                dead.add(ws)

        # prune any sockets that closed while we were sending
        for ws in dead:
            self.disconnect(ws, conversation_id)

        logger.debug("broadcast_to_conversation(%d) → %d clients", conversation_id, count)
        return count

    async def broadcast_all(self, payload: Any) -> int:
        """
        Push payload to every open WebSocket connection.
        Returns the number of clients successfully notified.
        """
        dead: set[WebSocket] = set()
        count = 0

        for ws in self._all_connections:
            if await self._send_json(ws, payload):
                count += 1
            else:
                dead.add(ws)

        for ws in dead:
            self._all_connections.discard(ws)

        logger.debug("broadcast_all → %d clients", count)
        return count

    # ── stats ────────────────────────────────────────────────────────────────

    @property
    def total_connections(self) -> int:
        return len(self._all_connections)

    def room_size(self, conversation_id: int) -> int:
        return len(self._connections.get(conversation_id, set()))


# Singleton — imported throughout the app
ws_manager = ConnectionManager()
