/**
 * AI Provider API Routes
 * REST endpoints for AI provider interactions
 */

import { Router, type Request, Response } from 'express';
import { getAIProviderManager } from '../lib/aiProviderManager';
import { RATE_LIMITS, DEFAULT_GENERATION_PARAMS } from '../config/aiProvidersConfig';
import rateLimit from 'express-rate-limit';

const router = Router();

// Rate limiting middleware for AI endpoints
const aiRateLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 100, // Limit each IP to 100 requests per windowMs
  message: {
    error: 'Too many AI requests from this IP',
    retryAfter: '60 seconds'
  },
  standardHeaders: true,
  legacyHeaders: false,
});

// Provider-specific rate limiters
const copilotLimiter = rateLimit({
  windowMs: 60 * 1000,
  max: RATE_LIMITS.copilot.requestsPerMinute,
  message: { error: 'Copilot API rate limit exceeded' },
});

// Apply rate limiting to all AI routes
router.use(aiRateLimiter);

/**
 * POST /api/ai/chat
 * Generate chat completion using specified provider
 */
router.post('/chat', async (req: Request, res: Response) => {
  try {
    const {
      messages,
      provider = 'auto',
      model,
      temperature,
      maxTokens,
      systemPrompt,
      stream = false
    } = req.body;

    if (!messages || !Array.isArray(messages)) {
      return res.status(400).json({
        error: 'Messages array is required',
        example: {
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: 'Hello!' }
          ]
        }
      });
    }

    const aiManager = getAIProviderManager();

    // Handle streaming response
    if (stream) {
      res.setHeader('Content-Type', 'text/event-stream');
      res.setHeader('Cache-Control', 'no-cache');
      res.setHeader('Connection', 'keep-alive');

      const userMessage = messages[messages.length - 1]?.content || '';
      
      try {
        await aiManager.streamCompletion(
          userMessage,
          (chunk: string) => {
            res.write(`data: ${JSON.stringify({ content: chunk })}\n\n`);
          },
          {
            provider: provider === 'auto' ? undefined : provider,
            model,
            temperature,
            maxTokens,
            systemPrompt,
          }
        );
        
        res.write('data: [DONE]\n\n');
        res.end();
      } catch (error) {
        res.write(`data: ${JSON.stringify({ error: error instanceof Error ? error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error) : String(error) })}\n\n`);
        res.end();
      }
      
      return;
    }

    // Non-streaming response
    const result = await aiManager.generateChatCompletion(messages, {
      provider: provider === 'auto' ? undefined : provider,
      model,
      temperature,
      maxTokens,
      systemPrompt,
    });

    res.json({
      success: true,
      result: {
        content: result.content,
        provider: result.provider,
        model: result.model,
        usage: result.usage,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI chat completion error:', error);
    res.status(500).json({
      error: 'Failed to generate chat completion',
      details: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error),
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/ai/completion
 * Generate simple text completion
 */
router.post('/completion', async (req: Request, res: Response) => {
  try {
    const {
      prompt,
      provider = 'auto',
      model,
      temperature,
      maxTokens,
      systemPrompt,
      useCase = 'chat' // chat, analysis, creative, code
    } = req.body;

    if (!prompt) {
      return res.status(400).json({
        error: 'Prompt is required',
        example: { prompt: 'Write a summary of market research for a coffee shop.' }
      });
    }

    const aiManager = getAIProviderManager();
    
    // Use default parameters based on use case
    const defaultParams = DEFAULT_GENERATION_PARAMS[useCase as keyof typeof DEFAULT_GENERATION_PARAMS] || DEFAULT_GENERATION_PARAMS.chat;
    
    const result = await aiManager.generateCompletion(prompt, {
      provider: provider === 'auto' ? undefined : provider,
      model,
      temperature: temperature ?? defaultParams.temperature,
      maxTokens: maxTokens ?? defaultParams.maxTokens,
      systemPrompt,
    });

    res.json({
      success: true,
      result: {
        content: result.content,
        provider: result.provider,
        model: result.model,
        usage: result.usage,
        useCase,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI completion error:', error);
    res.status(500).json({
      error: 'Failed to generate completion',
      details: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error),
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/ai/embeddings
 * Generate text embeddings
 */
router.post('/embeddings', async (req: Request, res: Response) => {
  try {
    const { input, provider = 'copilot', model } = req.body;

    if (!input) {
      return res.status(400).json({
        error: 'Input text is required',
        example: { input: 'Text to generate embeddings for' }
      });
    }

    const aiManager = getAIProviderManager();
    const embeddings = await aiManager.generateEmbeddings(input, { provider, model });

    res.json({
      success: true,
      embeddings,
      provider,
      model: model || 'text-embedding-ada-002',
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI embeddings error:', error);
    res.status(500).json({
      error: 'Failed to generate embeddings',
      details: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error),
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/ai/providers
 * List available providers and their status
 */
router.get('/providers', async (req: Request, res: Response) => {
  try {
    const aiManager = getAIProviderManager();
    const [health, providers] = await Promise.all([
      aiManager.getProvidersHealth(),
      aiManager.listAvailableProviders(),
    ]);

    res.json({
      success: true,
      providers: Object.keys(providers).map(name => ({
        name,
        enabled: providers[name].enabled,
        healthy: health[name]?.status === 'healthy',
        models: providers[name].models?.data || [],
        lastCheck: health[name]?.timestamp,
        error: health[name]?.error,
      })),
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI providers status error:', error);
    res.status(500).json({
      error: 'Failed to get providers status',
      details: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error),
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/ai/health
 * Health check for all AI providers
 */
router.get('/health', async (req: Request, res: Response) => {
  try {
    const aiManager = getAIProviderManager();
    const health = await aiManager.getProvidersHealth();
    
    const overallHealth = Object.values(health).every(
      (provider: any) => provider.status === 'healthy'
    );

    res.json({
      success: true,
      overallHealth: overallHealth ? 'healthy' : 'degraded',
      providers: health,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI health check error:', error);
    res.status(500).json({
      error: 'Failed to check AI providers health',
      details: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error),
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/ai/models
 * List available models for all providers
 */
router.get('/models', async (req: Request, res: Response) => {
  try {
    const { provider } = req.query;
    const aiManager = getAIProviderManager();
    const providers = await aiManager.listAvailableProviders();

    let models = {};
    
    if (provider && typeof provider === 'string') {
      // Get models for specific provider
      if (providers[provider]) {
        models = { [provider]: providers[provider].models };
      } else {
        return res.status(404).json({
          error: `Provider '${provider}' not found`,
          availableProviders: Object.keys(providers),
        });
      }
    } else {
      // Get models for all providers
      models = Object.keys(providers).reduce((acc, name) => {
        (acc as any)[name] = (providers as any)[name].models;
        return acc;
      }, {});
    }

    res.json({
      success: true,
      models,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI models error:', error);
    res.status(500).json({
      error: 'Failed to get models',
      details: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error),
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * GET /api/ai/stats
 * Get usage statistics for AI providers
 */
router.get('/stats', async (req: Request, res: Response) => {
  try {
    const aiManager = getAIProviderManager();
    const stats = aiManager.getProviderStats();

    res.json({
      success: true,
      stats,
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI stats error:', error);
    res.status(500).json({
      error: 'Failed to get AI provider statistics',
      details: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error),
      timestamp: new Date().toISOString(),
    });
  }
});

/**
 * POST /api/ai/test
 * Test AI provider functionality
 */
router.post('/test', async (req: Request, res: Response) => {
  try {
    const { provider = 'auto', prompt = 'Hello, this is a test message.' } = req.body;
    
    const aiManager = getAIProviderManager();
    const result = await aiManager.generateCompletion(prompt, {
      provider: provider === 'auto' ? undefined : provider,
      maxTokens: 50,
      temperature: 0.7,
    });

    res.json({
      success: true,
      test: {
        prompt,
        response: result.content,
        provider: result.provider,
        model: result.model,
      },
      timestamp: new Date().toISOString(),
    });

  } catch (error) {
    console.error('AI test error:', error);
    res.status(500).json({
      error: 'AI provider test failed',
      details: error instanceof Error ? error instanceof Error ? error.message : String(error) : String(error),
      timestamp: new Date().toISOString(),
    });
  }
});

export { router as aiProviderRoutes };