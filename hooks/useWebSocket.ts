import { useEffect, useRef, useState, useCallback } from 'react';
import { MapAction, ChatMessage } from '@/types';

export interface WebSocketMessage {
  type: 'map_update' | 'chat_update';
  sessionId: string;
  action?: string;
  data?: any;
  message?: Partial<ChatMessage>;
}

export function useWebSocket(sessionId: string | null) {
  const [isConnected, setIsConnected] = useState(false);
  const wsRef = useRef<WebSocket | null>(null);
  const [lastMessage, setLastMessage] = useState<WebSocketMessage | null>(null);

  const connect = useCallback(() => {
    if (!sessionId || wsRef.current?.readyState === WebSocket.OPEN) return;

    // In development, connect to the backend server port (5000)
    // In production, use the same host as the frontend
    const isDevelopment = process.env.NODE_ENV === 'development';
    const protocol = window.location.protocol === "https:" ? "wss:" : "ws:";
    const wsUrl = isDevelopment 
      ? `${protocol}//localhost:5000/ws`
      : `${protocol}//${window.location.host}/ws`;
    
    const ws = new WebSocket(wsUrl);
    wsRef.current = ws;

    ws.onopen = () => {
      setIsConnected(true);
      console.log('WebSocket connected');
    };

    ws.onmessage = (event) => {
      try {
        const message = JSON.parse(event.data) as WebSocketMessage;
        setLastMessage(message);
      } catch (error) {
        console.error('Error parsing WebSocket message:', error);
      }
    };

    ws.onclose = () => {
      setIsConnected(false);
      console.log('WebSocket disconnected');
      // Attempt to reconnect after 3 seconds
      setTimeout(() => {
        if (sessionId) connect();
      }, 3000);
    };

    ws.onerror = (error) => {
      console.error('WebSocket error:', error);
      setIsConnected(false);
    };
  }, [sessionId]);

  const disconnect = useCallback(() => {
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
      setIsConnected(false);
    }
  }, []);

  const sendMessage = useCallback((message: WebSocketMessage) => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify(message));
    } else {
      console.warn('WebSocket not connected');
    }
  }, []);

  const sendMapUpdate = useCallback((action: MapAction['type'], data: any) => {
    if (!sessionId) return;
    
    sendMessage({
      type: 'map_update',
      sessionId,
      action,
      data
    });
  }, [sessionId, sendMessage]);

  const sendChatUpdate = useCallback((message: Partial<ChatMessage>) => {
    if (!sessionId) return;
    
    sendMessage({
      type: 'chat_update',
      sessionId,
      message
    });
  }, [sessionId, sendMessage]);

  useEffect(() => {
    if (sessionId) {
      connect();
    } else {
      disconnect();
    }

    return () => {
      disconnect();
    };
  }, [sessionId, connect, disconnect]);

  return {
    isConnected,
    lastMessage,
    sendMapUpdate,
    sendChatUpdate,
    connect,
    disconnect
  };
}
