import { Router } from 'itty-router';
import { createResponse, getDatabase, checkRateLimit } from '../src/utils';

const router = Router({ base: '/api/sessions' });

// Generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// Default map state
const DEFAULT_MAP_STATE = {
  center: { lat: 40.7128, lng: -74.0060 }, // NYC
  zoom: 12,
  layers: [
    { id: 'demographics', name: 'Demographics', visible: false, type: 'heatmap' },
    { id: 'competitors', name: 'Competitors', visible: false, type: 'markers' },
    { id: 'traffic', name: 'Foot Traffic', visible: false, type: 'heatmap' },
    { id: 'sites', name: 'Available Sites', visible: false, type: 'markers' },
    { id: 'zoning', name: 'Zoning', visible: false, type: 'overlay' },
  ]
};

// POST /api/sessions - Create new session
router.post('/', async (request) => {
  try {
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!await checkRateLimit(request.env, `sessions:${clientIP}`, 30, 60)) {
      return createResponse(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json().catch(() => ({}));
    const sessionId = generateUUID();
    
    const session = {
      id: sessionId,
      userId: 'demo-user',
      title: body.title || 'New Research Session',
      mapState: body.mapState || DEFAULT_MAP_STATE,
      metadata: body.metadata || {
        businessType: 'restaurant',
        targetMarket: 'general',
        budget: 10000,
        timeline: '3-6 months'
      },
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    // Store session in KV or D1
    if (request.env.CACHE) {
      await request.env.CACHE.put(
        `session:${sessionId}`, 
        JSON.stringify(session),
        { expirationTtl: 24 * 60 * 60 } // 24 hours
      );
    }

    return createResponse(session);

  } catch (error) {
    console.error('Session creation error:', error);
    return createResponse(
      { error: 'Failed to create session', message: error.message },
      { status: 500 }
    );
  }
});

// GET /api/sessions/:sessionId - Get session by ID
router.get('/:sessionId', async (request) => {
  try {
    const { sessionId } = request.params;
    
    if (!sessionId) {
      return createResponse(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    let session = null;
    
    // Try to get from KV first
    if (request.env.CACHE) {
      const cached = await request.env.CACHE.get(`session:${sessionId}`);
      if (cached) {
        session = JSON.parse(cached);
      }
    }

    if (!session) {
      return createResponse(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    return createResponse(session);

  } catch (error) {
    console.error('Session retrieval error:', error);
    return createResponse(
      { error: 'Failed to retrieve session', message: error.message },
      { status: 500 }
    );
  }
});

// PATCH /api/sessions/:sessionId - Update session
router.patch('/:sessionId', async (request) => {
  try {
    const { sessionId } = request.params;
    const updates = await request.json();

    if (!sessionId) {
      return createResponse(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Get existing session
    let session = null;
    if (request.env.CACHE) {
      const cached = await request.env.CACHE.get(`session:${sessionId}`);
      if (cached) {
        session = JSON.parse(cached);
      }
    }

    if (!session) {
      return createResponse(
        { error: 'Session not found' },
        { status: 404 }
      );
    }

    // Update session
    const updatedSession = {
      ...session,
      ...updates,
      id: sessionId, // Prevent ID changes
      updatedAt: new Date().toISOString(),
    };

    // Store updated session
    if (request.env.CACHE) {
      await request.env.CACHE.put(
        `session:${sessionId}`,
        JSON.stringify(updatedSession),
        { expirationTtl: 24 * 60 * 60 }
      );
    }

    return createResponse(updatedSession);

  } catch (error) {
    console.error('Session update error:', error);
    return createResponse(
      { error: 'Failed to update session', message: error.message },
      { status: 500 }
    );
  }
});

// GET /api/sessions - List user sessions
router.get('/', async (request) => {
  try {
    // In a real implementation, this would query the database
    // For demo purposes, return empty array
    return createResponse({
      sessions: [],
      total: 0,
      message: 'Session listing not implemented in demo'
    });

  } catch (error) {
    console.error('Session listing error:', error);
    return createResponse(
      { error: 'Failed to list sessions', message: error.message },
      { status: 500 }
    );
  }
});

export const sessionRoutes = router;