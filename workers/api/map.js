import { Router } from 'itty-router';
import { createResponse, checkRateLimit } from '../src/utils';

const router = Router({ base: '/api/map' });

// GET /api/map/state/:sessionId - Get map state for session
router.get('/state/:sessionId', async (request) => {
  try {
    const { sessionId } = request.params;

    if (!sessionId) {
      return createResponse(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    // Get session from KV to get map state
    let mapState = null;
    if (request.env.CACHE) {
      const cached = await request.env.CACHE.get(`session:${sessionId}`);
      if (cached) {
        const session = JSON.parse(cached);
        mapState = session.mapState;
      }
    }

    if (!mapState) {
      // Return default map state
      mapState = {
        center: { lat: 40.7128, lng: -74.0060 },
        zoom: 12,
        layers: [
          { id: 'demographics', name: 'Demographics', visible: false, type: 'heatmap' },
          { id: 'competitors', name: 'Competitors', visible: false, type: 'markers' },
          { id: 'traffic', name: 'Foot Traffic', visible: false, type: 'heatmap' },
          { id: 'sites', name: 'Available Sites', visible: false, type: 'markers' },
          { id: 'zoning', name: 'Zoning', visible: false, type: 'overlay' },
        ]
      };
    }

    return createResponse({
      sessionId,
      mapState,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Map state retrieval error:', error);
    return createResponse(
      { error: 'Failed to retrieve map state', message: error.message },
      { status: 500 }
    );
  }
});

// PUT /api/map/state/:sessionId - Update map state for session
router.put('/state/:sessionId', async (request) => {
  try {
    const { sessionId } = request.params;
    const body = await request.json();
    const { mapState } = body;

    if (!sessionId) {
      return createResponse(
        { error: 'Session ID required' },
        { status: 400 }
      );
    }

    if (!mapState) {
      return createResponse(
        { error: 'Map state required' },
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

    // Update session with new map state
    const updatedSession = {
      ...session,
      mapState,
      updatedAt: new Date().toISOString()
    };

    // Store updated session
    if (request.env.CACHE) {
      await request.env.CACHE.put(
        `session:${sessionId}`,
        JSON.stringify(updatedSession),
        { expirationTtl: 24 * 60 * 60 }
      );
    }

    return createResponse({
      success: true,
      sessionId,
      mapState,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Map state update error:', error);
    return createResponse(
      { error: 'Failed to update map state', message: error.message },
      { status: 500 }
    );
  }
});

// POST /api/map/analysis - Trigger map-based analysis
router.post('/analysis', async (request) => {
  try {
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!await checkRateLimit(request.env, `analysis:${clientIP}`, 30, 60)) {
      return createResponse(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { sessionId, location, analysisType, parameters } = body;

    if (!sessionId || !location || !analysisType) {
      return createResponse(
        { error: 'sessionId, location, and analysisType required' },
        { status: 400 }
      );
    }

    // Mock analysis result based on type
    let analysisResult = {};
    
    switch (analysisType) {
      case 'demographics':
        analysisResult = {
          type: 'demographics',
          data: {
            population: 125000,
            medianAge: 34,
            medianIncome: 65000,
            education: 'College educated: 68%',
            summary: 'Young professional demographic with high disposable income'
          }
        };
        break;
        
      case 'competitors':
        analysisResult = {
          type: 'competitors',
          data: {
            totalCompetitors: 12,
            density: 'Medium',
            topCompetitors: [
              { name: 'Coffee Shop A', distance: '0.2 miles', rating: 4.2 },
              { name: 'Restaurant B', distance: '0.3 miles', rating: 4.5 },
              { name: 'Cafe C', distance: '0.4 miles', rating: 3.8 }
            ],
            summary: 'Moderate competition with room for differentiation'
          }
        };
        break;
        
      case 'traffic':
        analysisResult = {
          type: 'traffic',
          data: {
            peakHours: '8-10 AM, 12-2 PM, 5-7 PM',
            weekdayTraffic: 'High',
            weekendTraffic: 'Medium',
            footTrafficScore: 8.2,
            summary: 'Excellent foot traffic during business hours'
          }
        };
        break;
        
      default:
        analysisResult = {
          type: analysisType,
          data: {
            summary: `Analysis completed for ${analysisType}`
          }
        };
    }

    return createResponse({
      sessionId,
      location,
      analysisType,
      result: analysisResult,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Map analysis error:', error);
    return createResponse(
      { error: 'Analysis failed', message: error.message },
      { status: 500 }
    );
  }
});

export const mapRoutes = router;