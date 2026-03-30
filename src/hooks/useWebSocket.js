import { useEffect, useRef, useCallback } from 'react';

const WS_BASE_URL = import.meta.env.VITE_WS_BASE_URL || 'ws://localhost:8000';

/**
 * useWebSocket — manages a persistent WebSocket connection with auto-reconnect.
 *
 * @param {string|null} conversationId - Join a specific conversation room.
 *                                       Pass null to receive ALL messages.
 * @param {function} onMessage        - Callback invoked with parsed payload for each WS message.
 * @param {function} onOpen           - Optional callback when connection opens.
 * @param {function} onClose          - Optional callback when connection closes.
 *
 * @returns {{ send: function, isConnected: boolean }}
 *
 * @example
 *   const { send, isConnected } = useWebSocket(
 *     activeConvId,
 *     (payload) => { ... },
 *   );
 */
export function useWebSocket(conversationId, onMessage, { onOpen, onClose } = {}) {
  const wsRef = useRef(null);
  const reconnectTimerRef = useRef(null);
  const onMessageRef = useRef(onMessage);
  const conversationIdRef = useRef(conversationId);
  const isMountedRef = useRef(true);

  // Keep refs in sync so callbacks always see latest values
  useEffect(() => {
    onMessageRef.current = onMessage;
  }, [onMessage]);

  useEffect(() => {
    conversationIdRef.current = conversationId;
  }, [conversationId]);

  const connect = useCallback(() => {
    if (!isMountedRef.current) return;

    const qs = conversationIdRef.current != null
      ? `?conversation_id=${conversationIdRef.current}`
      : '';
    const url = `${WS_BASE_URL}/ws/chat${qs}`;

    try {
      const ws = new WebSocket(url);
      wsRef.current = ws;

      ws.onopen = () => {
        if (!isMountedRef.current) { ws.close(); return; }
        console.log('[WS] Connected — conversation_id:', conversationIdRef.current);
        onOpen?.();
      };

      ws.onmessage = (event) => {
        if (!isMountedRef.current) return;
        console.log('[WS] Raw message received:', event.data);
        try {
          const payload = JSON.parse(event.data);
          console.log('[WS] Parsed payload:', payload);
          onMessageRef.current?.(payload);
        } catch (err) {
          console.warn('[WS] Failed to parse message:', err);
        }
      };

      ws.onerror = (err) => {
        console.warn('[WS] Error:', err);
      };

      ws.onclose = () => {
        if (!isMountedRef.current) return;
        console.log('[WS] Disconnected, reconnecting in 3s...');
        onClose?.();
        reconnectTimerRef.current = setTimeout(connect, 3000);
      };
    } catch (err) {
      console.warn('[WS] Failed to open connection:', err);
      reconnectTimerRef.current = setTimeout(connect, 3000);
    }
  }, []); // intentionally empty — connect captures refs via closure

  useEffect(() => {
    isMountedRef.current = true;
    connect();

    return () => {
      isMountedRef.current = false;
      clearTimeout(reconnectTimerRef.current);
      if (wsRef.current) {
        wsRef.current.onclose = null; // prevent reconnect on intentional close
        wsRef.current.close();
        wsRef.current = null;
      }
    };
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  /**
   * Switch conversation room without reconnecting.
   * Opens a new WS with the new conversation_id param.
   */
  useEffect(() => {
    if (!wsRef.current || wsRef.current.readyState !== WebSocket.OPEN) return;

    // Close old connection — new one will be opened by the connect effect
    clearTimeout(reconnectTimerRef.current);
    wsRef.current.onclose = null;
    wsRef.current.close();
    wsRef.current = null;

    // Reconnect with new room
    connect();
  }, [conversationId]); // eslint-disable-line react-hooks/exhaustive-deps

  const send = useCallback((data) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(typeof data === 'string' ? data : JSON.stringify(data));
    }
  }, []);

  const isConnected = wsRef.current?.readyState === WebSocket.OPEN;

  return { send, isConnected };
}
