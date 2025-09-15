import { Router } from 'itty-router';
import { handleCORS, createResponse } from './src/utils';
import { authRoutes } from './api/auth';
import { sessionRoutes } from './api/sessions';
import { messageRoutes } from './api/messages';
import { copilotRoutes } from './api/copilot';
import { mapRoutes } from './api/map';

// Create the main router
const router = Router();

// CORS preflight handling
router.all('*', handleCORS);

// Health check endpoint
router.get('/health', () => {
  return createResponse({ 
    status: 'healthy', 
    timestamp: new Date().toISOString(),
    version: '1.0.0'
  });
});

// API Routes
router.all('/api/auth/*', authRoutes.handle);
router.all('/api/sessions/*', sessionRoutes.handle);
router.all('/api/messages/*', messageRoutes.handle);
router.all('/api/copilotkit/*', copilotRoutes.handle);
router.all('/api/map/*', mapRoutes.handle);

// 404 handler
router.all('*', () => {
  return createResponse(
    { error: 'Not Found', message: 'API endpoint not found' }, 
    { status: 404 }
  );
});

// Durable Object for session management (optional)
export class SessionStore {
  constructor(state, env) {
    this.state = state;
    this.env = env;
  }

  async fetch(request) {
    // Handle session storage and real-time updates
    const url = new URL(request.url);
    const sessionId = url.pathname.split('/').pop();
    
    if (request.method === 'GET') {
      const session = await this.state.storage.get(`session:${sessionId}`);
      return new Response(JSON.stringify(session || {}), {
        headers: { 'Content-Type': 'application/json' }
      });
    }
    
    if (request.method === 'PUT') {
      const data = await request.json();
      await this.state.storage.put(`session:${sessionId}`, data);
      return new Response(JSON.stringify({ success: true }));
    }
    
    return new Response('Method not allowed', { status: 405 });
  }
}

// Main worker entry point
export default {
  async fetch(request, env, ctx) {
    try {
      // Add environment and context to request for handlers
      request.env = env;
      request.ctx = ctx;
      
      return await router.handle(request);
    } catch (error) {
      console.error('Worker error:', error);
      return createResponse(
        { 
          error: 'Internal Server Error', 
          message: error.message 
        }, 
        { status: 500 }
      );
    }
  }
};