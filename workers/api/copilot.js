import { Router } from 'itty-router';
import { createResponse, checkRateLimit } from '../src/utils';

const router = Router({ base: '/api/copilotkit' });

// GET /api/copilotkit - CopilotKit backend status
router.get('/', async (request) => {
  try {
    const openaiConfigured = !!request.env.OPENAI_API_KEY;
    const githubConfigured = !!request.env.GITHUB_TOKEN;

    return createResponse({
      status: 'operational',
      version: '1.0.0',
      timestamp: new Date().toISOString(),
      backends: {
        openai: {
          configured: openaiConfigured,
          fallback: true
        },
        copilotApi: {
          configured: githubConfigured,
          healthy: false, // Workers don't run copilot-api proxy
          url: null
        }
      },
      features: {
        multiAgent: true,
        mapIntegration: true,
        marketResearch: true,
        realTimeUpdates: true
      }
    });

  } catch (error) {
    console.error('CopilotKit status error:', error);
    return createResponse(
      { error: 'Failed to get status', message: error.message },
      { status: 500 }
    );
  }
});

// POST /api/copilotkit/chat - Chat completion endpoint
router.post('/chat', async (request) => {
  try {
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!await checkRateLimit(request.env, `copilot:${clientIP}`, 60, 60)) {
      return createResponse(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { messages, model = 'gpt-3.5-turbo', sessionId } = body;

    if (!messages || !Array.isArray(messages)) {
      return createResponse(
        { error: 'Messages array required' },
        { status: 400 }
      );
    }

    // Use OpenAI API
    if (!request.env.OPENAI_API_KEY) {
      return createResponse(
        { error: 'OpenAI API key not configured' },
        { status: 503 }
      );
    }

    const openaiResponse = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${request.env.OPENAI_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model,
        messages,
        max_tokens: 1000,
        temperature: 0.7,
        stream: false
      })
    });

    if (!openaiResponse.ok) {
      const error = await openaiResponse.text();
      console.error('OpenAI API error:', error);
      return createResponse(
        { error: 'OpenAI API request failed', details: error },
        { status: openaiResponse.status }
      );
    }

    const completion = await openaiResponse.json();
    
    return createResponse({
      id: completion.id,
      choices: completion.choices,
      usage: completion.usage,
      model: completion.model,
      sessionId,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Chat completion error:', error);
    return createResponse(
      { error: 'Chat completion failed', message: error.message },
      { status: 500 }
    );
  }
});

// POST /api/copilotkit/actions - Handle CopilotKit actions
router.post('/actions', async (request) => {
  try {
    const body = await request.json();
    const { action, parameters, sessionId } = body;

    // Handle different actions
    switch (action) {
      case 'updateMapLocation':
        return createResponse({
          success: true,
          action,
          result: `Location updated to ${parameters.address}`,
          timestamp: new Date().toISOString()
        });

      case 'setBusinessContext':
        return createResponse({
          success: true,
          action,
          result: `Business context set for ${parameters.businessType}`,
          timestamp: new Date().toISOString()
        });

      case 'triggerAgentAnalysis':
        return createResponse({
          success: true,
          action,
          result: `${parameters.agentType} analysis initiated`,
          timestamp: new Date().toISOString()
        });

      default:
        return createResponse(
          { error: 'Unknown action', action },
          { status: 400 }
        );
    }

  } catch (error) {
    console.error('Action handling error:', error);
    return createResponse(
      { error: 'Action handling failed', message: error.message },
      { status: 500 }
    );
  }
});

export const copilotRoutes = router;