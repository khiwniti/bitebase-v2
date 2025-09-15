import { WebSocketServer, WebSocket } from "ws";
import { Server } from "http";

export interface MapUpdateMessage {
  type: 'map_update';
  sessionId: string;
  action: 'layer_toggle' | 'location_analysis' | 'marker_add' | 'view_change';
  data: any;
}

export interface ChatUpdateMessage {
  type: 'chat_update';
  sessionId: string;
  message: {
    role: 'user' | 'assistant';
    content: string;
    metadata?: any;
  };
}

export type WebSocketMessage = MapUpdateMessage | ChatUpdateMessage;

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private sessionConnections = new Map<string, Set<WebSocket>>();

  initialize(server: Server) {
    this.wss = new WebSocketServer({ 
      server, 
      path: '/ws',
      verifyClient: (info: any) => {
        // Add authentication verification here if needed
        return true;
      }
    });

    this.wss.on('connection', (ws, request) => {
      console.log('WebSocket connection established');

      ws.on('message', (data) => {
        try {
          const message = JSON.parse(data.toString()) as WebSocketMessage & { sessionId: string };
          
          if (message.sessionId) {
            this.handleMessage(ws, message);
          }
        } catch (error) {
          console.error('Error parsing WebSocket message:', error);
          ws.send(JSON.stringify({ error: 'Invalid message format' }));
        }
      });

      ws.on('close', () => {
        this.removeConnectionFromAllSessions(ws);
        console.log('WebSocket connection closed');
      });

      ws.on('error', (error) => {
        console.error('WebSocket error:', error);
        this.removeConnectionFromAllSessions(ws);
      });
    });
  }

  private handleMessage(ws: WebSocket, message: WebSocketMessage & { sessionId: string }) {
    const { sessionId } = message;

    // Add connection to session if not already added
    if (!this.sessionConnections.has(sessionId)) {
      this.sessionConnections.set(sessionId, new Set());
    }
    this.sessionConnections.get(sessionId)!.add(ws);

    // Broadcast message to all clients in the same session
    this.broadcastToSession(sessionId, message, ws);
  }

  broadcastToSession(sessionId: string, message: WebSocketMessage, excludeWs?: WebSocket) {
    const connections = this.sessionConnections.get(sessionId);
    if (!connections) return;

    const messageStr = JSON.stringify(message);

    connections.forEach((clientWs) => {
      if (clientWs !== excludeWs && clientWs.readyState === WebSocket.OPEN) {
        clientWs.send(messageStr);
      }
    });
  }

  sendToSession(sessionId: string, message: WebSocketMessage) {
    this.broadcastToSession(sessionId, message);
  }

  private removeConnectionFromAllSessions(ws: WebSocket) {
    this.sessionConnections.forEach((connections, sessionId) => {
      connections.delete(ws);
      if (connections.size === 0) {
        this.sessionConnections.delete(sessionId);
      }
    });
  }

  getSessionConnectionCount(sessionId: string): number {
    return this.sessionConnections.get(sessionId)?.size || 0;
  }
}

export const wsManager = new WebSocketManager();
