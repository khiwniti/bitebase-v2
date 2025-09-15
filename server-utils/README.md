# BiteBase Intelligence Server API Documentation

## Overview

The BiteBase Intelligence server provides a comprehensive AI-powered market research platform with support for both native CopilotKit integration and external AI API endpoints. This document covers the implementation of GitHub Copilot API integration as an alternative backend for production AI web applications.

## Table of Contents

1. [Current Architecture](#current-architecture)
2. [GitHub Copilot API Integration](#github-copilot-api-integration)
3. [Production Deployment Guide](#production-deployment-guide)
4. [API Endpoints](#api-endpoints)
5. [Configuration](#configuration)
6. [Security Considerations](#security-considerations)
7. [Monitoring and Scaling](#monitoring-and-scaling)

## Current Architecture

The server currently uses:
- **CopilotKit**: Native integration for AI-powered chat and agent interactions
- **Express.js**: RESTful API server
- **SQLite**: Local database for sessions and data storage
- **WebSocket**: Real-time communication for map updates and chat
- **LangGraph**: Multi-agent orchestration for market research

## GitHub Copilot API Integration

### What is `npx copilot-api@latest`?

The `copilot-api` tool is a reverse-engineered proxy server that converts GitHub Copilot's internal API into OpenAI/Anthropic-compatible endpoints. This allows you to use your GitHub Copilot subscription as a backend for AI applications.

**Key Features:**
- OpenAI Chat Completions API compatibility (`/v1/chat/completions`)
- Anthropic Messages API compatibility (`/v1/messages`)
- Model endpoints (`/v1/models`)
- Embeddings support (`/v1/embeddings`)
- Streaming responses
- Rate limiting
- Usage dashboard
- Integration with existing AI workflows

### Implementation Options

#### Option 1: Direct Integration (Recommended for Development)

Add the Copilot API as a fallback or primary provider in your existing server:

```typescript
// server/providers/copilotProvider.ts
import fetch from 'node-fetch';

export class CopilotAPIProvider {
  private baseURL: string;
  private githubToken: string;

  constructor(baseURL = 'http://localhost:4141', githubToken: string) {
    this.baseURL = baseURL;
    this.githubToken = githubToken;
  }

  async chatCompletion(messages: any[], options: any = {}) {
    const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.githubToken}`
      },
      body: JSON.stringify({
        model: options.model || 'gpt-3.5-turbo',
        messages,
        stream: options.stream || false,
        temperature: options.temperature || 0.7,
        max_tokens: options.max_tokens || 1000
      })
    });

    if (!response.ok) {
      throw new Error(`Copilot API error: ${response.statusText}`);
    }

    return response.json();
  }

  async embeddings(text: string) {
    const response = await fetch(`${this.baseURL}/v1/embeddings`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${this.githubToken}`
      },
      body: JSON.stringify({
        model: 'text-embedding-ada-002',
        input: text
      })
    });

    return response.json();
  }
}
```

#### Option 2: Standalone Deployment (Production)

Deploy the Copilot API as a separate service and configure your server to use it:

```typescript
// server/config/aiProviders.ts
export const AI_PROVIDERS = {
  copilot: {
    enabled: process.env.COPILOT_API_ENABLED === 'true',
    baseURL: process.env.COPILOT_API_URL || 'http://localhost:4141',
    token: process.env.GITHUB_TOKEN,
    maxRequestsPerMinute: parseInt(process.env.COPILOT_RATE_LIMIT || '60')
  },
  openai: {
    enabled: process.env.OPENAI_API_KEY ? true : false,
    baseURL: 'https://api.openai.com/v1',
    token: process.env.OPENAI_API_KEY
  },
  anthropic: {
    enabled: process.env.ANTHROPIC_API_KEY ? true : false,
    baseURL: 'https://api.anthropic.com/v1',
    token: process.env.ANTHROPIC_API_KEY
  }
};
```

## Production Deployment Guide

### Prerequisites

1. **GitHub Copilot Subscription**: Individual, Business, or Enterprise
2. **GitHub Token**: Personal Access Token with Copilot access
3. **Bun Runtime**: Required for running the copilot-api server
4. **Docker** (recommended): For containerized deployment

### Step 1: Setup Copilot API Server

#### Manual Setup
```bash
# Clone the repository
git clone https://github.com/ericc-ch/copilot-api.git
cd copilot-api

# Install Bun (if not already installed)
curl -fsSL https://bun.sh/install | bash

# Install dependencies
bun install

# Authenticate with GitHub
bun run auth
# or set environment variable
export GITHUB_TOKEN=your_github_token_here
```

#### Docker Setup (Recommended)
```dockerfile
# Dockerfile for copilot-api
FROM oven/bun:latest

WORKDIR /app

# Copy copilot-api source
COPY . .

# Install dependencies
RUN bun install

# Expose port
EXPOSE 4141

# Set environment variables
ENV GITHUB_TOKEN=""
ENV PORT=4141

# Start the server
CMD ["bun", "run", "start"]
```

```yaml
# docker-compose.yml
version: '3.8'
services:
  copilot-api:
    build: ./copilot-api
    ports:
      - "4141:4141"
    environment:
      - GITHUB_TOKEN=${GITHUB_TOKEN}
      - PORT=4141
      - MAX_REQUESTS_PER_MINUTE=60
    volumes:
      - copilot_data:/root/.local/share/copilot-api
    restart: unless-stopped

  bitebase-server:
    build: .
    ports:
      - "5000:5000"
    environment:
      - COPILOT_API_URL=http://copilot-api:4141
      - COPILOT_API_ENABLED=true
      - GITHUB_TOKEN=${GITHUB_TOKEN}
    depends_on:
      - copilot-api
    restart: unless-stopped

volumes:
  copilot_data:
```

### Step 2: Configure BiteBase Server

Add Copilot API configuration to your environment:

```bash
# .env
# Copilot API Configuration
COPILOT_API_ENABLED=true
COPILOT_API_URL=http://localhost:4141
GITHUB_TOKEN=your_github_token_here
COPILOT_RATE_LIMIT=60

# Fallback providers
OPENAI_API_KEY=your_openai_key
ANTHROPIC_API_KEY=your_anthropic_key
```

### Step 3: Update Server Implementation

```typescript
// server/lib/aiProvider.ts
import { CopilotAPIProvider } from '../providers/copilotProvider';
import { AI_PROVIDERS } from '../config/aiProviders';

export class AIProvider {
  private providers: Map<string, any> = new Map();

  constructor() {
    // Initialize Copilot API if enabled
    if (AI_PROVIDERS.copilot.enabled) {
      this.providers.set('copilot', new CopilotAPIProvider(
        AI_PROVIDERS.copilot.baseURL,
        AI_PROVIDERS.copilot.token
      ));
    }
    
    // Initialize other providers...
  }

  async generateCompletion(prompt: string, options: any = {}) {
    const provider = options.provider || 'copilot';
    
    try {
      const aiProvider = this.providers.get(provider);
      if (!aiProvider) {
        throw new Error(`Provider ${provider} not available`);
      }

      return await aiProvider.chatCompletion([
        { role: 'user', content: prompt }
      ], options);
    } catch (error) {
      console.error(`AI Provider ${provider} error:`, error);
      
      // Fallback to other providers
      return this.fallbackGeneration(prompt, options);
    }
  }

  private async fallbackGeneration(prompt: string, options: any) {
    const fallbackOrder = ['openai', 'anthropic', 'copilot'];
    
    for (const providerName of fallbackOrder) {
      try {
        const provider = this.providers.get(providerName);
        if (provider) {
          return await provider.chatCompletion([
            { role: 'user', content: prompt }
          ], options);
        }
      } catch (error) {
        console.warn(`Fallback provider ${providerName} failed:`, error);
        continue;
      }
    }
    
    throw new Error('All AI providers failed');
  }
}
```

## API Endpoints

### Native BiteBase Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/auth/user` | GET | Get current user information |
| `/api/chat/sessions` | GET, POST | Manage chat sessions |
| `/api/chat/sessions/:id/messages` | GET, POST | Chat messages |
| `/api/reports/generate/:sessionId` | POST | Generate market research reports |
| `/api/copilotkit` | POST | CopilotKit runtime endpoint |

### Copilot API Proxy Endpoints

When Copilot API is enabled, the following endpoints become available:

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/v1/chat/completions` | POST | OpenAI-compatible chat completions |
| `/v1/models` | GET | List available models |
| `/v1/embeddings` | POST | Generate text embeddings |
| `/v1/messages` | POST | Anthropic-compatible messages |
| `/dashboard` | GET | Copilot API usage dashboard |

### Example API Usage

```javascript
// Chat completion using Copilot API
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    provider: 'copilot',
    messages: [
      { role: 'system', content: 'You are a market research assistant.' },
      { role: 'user', content: 'Analyze the restaurant market in downtown Seattle.' }
    ],
    stream: true
  })
});

// Streaming response handling
const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = new TextDecoder().decode(value);
  console.log('Received:', chunk);
}
```

## Configuration

### Environment Variables

```bash
# Core Server Configuration
NODE_ENV=production
PORT=5000
DATABASE_URL=./data/database.db
SESSION_SECRET=your-secret-key

# Copilot API Configuration
COPILOT_API_ENABLED=true
COPILOT_API_URL=http://copilot-api:4141
GITHUB_TOKEN=your_github_token_here
COPILOT_RATE_LIMIT=60
COPILOT_MAX_RETRIES=3
COPILOT_TIMEOUT=30000

# Fallback AI Providers
OPENAI_API_KEY=sk-your-openai-key
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key

# External APIs
GEOAPIFY_API_KEY=your-geoapify-key
MAPBOX_API_KEY=your-mapbox-key
SEARCH_API_KEY=your-search-key
```

### Rate Limiting Configuration

```typescript
// server/middleware/rateLimiter.ts
import rateLimit from 'express-rate-limit';

export const copilotAPILimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: parseInt(process.env.COPILOT_RATE_LIMIT || '60'),
  message: 'Too many requests to Copilot API',
  standardHeaders: true,
  legacyHeaders: false,
});
```

## Security Considerations

### Token Management
- **GitHub Token Storage**: Use environment variables or secret management services
- **Token Rotation**: Implement regular token rotation for security
- **Scope Limitation**: Use minimal required scopes for GitHub tokens

### Network Security
```typescript
// server/middleware/security.ts
import helmet from 'helmet';
import cors from 'cors';

export const securityMiddleware = [
  helmet(),
  cors({
    origin: process.env.ALLOWED_ORIGINS?.split(',') || ['http://localhost:3000'],
    credentials: true
  }),
  // IP whitelist for Copilot API access
  (req, res, next) => {
    const allowedIPs = process.env.COPILOT_ALLOWED_IPS?.split(',') || [];
    if (allowedIPs.length > 0 && !allowedIPs.includes(req.ip)) {
      return res.status(403).json({ error: 'IP not allowed' });
    }
    next();
  }
];
```

### Authentication
```typescript
// server/middleware/auth.ts
export const apiKeyAuth = (req, res, next) => {
  const apiKey = req.headers['x-api-key'];
  const validKeys = process.env.API_KEYS?.split(',') || [];
  
  if (!validKeys.includes(apiKey)) {
    return res.status(401).json({ error: 'Invalid API key' });
  }
  
  next();
};
```

## Monitoring and Scaling

### Health Checks
```typescript
// server/routes/health.ts
export const healthRoutes = (app) => {
  app.get('/health', async (req, res) => {
    const health = {
      status: 'healthy',
      timestamp: new Date().toISOString(),
      services: {}
    };

    // Check Copilot API
    try {
      const copilotResponse = await fetch(`${process.env.COPILOT_API_URL}/v1/models`);
      health.services.copilot = copilotResponse.ok ? 'healthy' : 'unhealthy';
    } catch (error) {
      health.services.copilot = 'unhealthy';
    }

    // Check database
    // Check other services...

    res.json(health);
  });
};
```

### Prometheus Metrics
```typescript
// server/middleware/metrics.ts
import promClient from 'prom-client';

const requestCounter = new promClient.Counter({
  name: 'copilot_api_requests_total',
  help: 'Total number of requests to Copilot API',
  labelNames: ['method', 'status_code', 'provider']
});

const requestDuration = new promClient.Histogram({
  name: 'copilot_api_request_duration_seconds',
  help: 'Request duration to Copilot API',
  labelNames: ['method', 'provider']
});

export const metricsMiddleware = (req, res, next) => {
  const start = Date.now();
  
  res.on('finish', () => {
    const duration = (Date.now() - start) / 1000;
    requestCounter.inc({ 
      method: req.method, 
      status_code: res.statusCode,
      provider: req.aiProvider || 'unknown'
    });
    requestDuration.observe({ 
      method: req.method,
      provider: req.aiProvider || 'unknown'
    }, duration);
  });
  
  next();
};
```

## Limitations and Risks

### Technical Limitations
- **Reverse Engineering**: Not officially supported by GitHub
- **Rate Limits**: GitHub Copilot has usage quotas (300 requests/month for individual plans)
- **API Changes**: GitHub may change their internal API, breaking functionality
- **Performance**: Single-threaded by default, limited concurrency
- **No SLA**: No service level agreements or guaranteed uptime

### Legal and Compliance
- **Terms of Service**: May violate GitHub's ToS for commercial use at scale
- **Account Suspension**: Excessive usage may flag your GitHub account
- **No Official Support**: Community-maintained tool with no official backing

### Production Considerations
- **Reliability**: Dependent on GitHub Copilot service uptime
- **Scalability**: Not optimized for high-traffic production environments
- **Security**: Requires careful token management and network security
- **Monitoring**: Limited built-in monitoring compared to official providers

## Alternatives for Production

1. **Official GitHub Copilot APIs**: Available through Microsoft 365 Copilot extensibility
2. **Azure OpenAI Service**: Enterprise-grade OpenAI API with SLA
3. **Anthropic Claude API**: Direct access to Claude models
4. **Open Source Solutions**: 
   - Ollama for local LLM deployment
   - Hugging Face Inference API
   - AWS Bedrock for managed AI services

## Getting Started

1. **Development Setup**:
   ```bash
   # Start Copilot API locally
   npx copilot-api@latest start
   
   # Update your .env
   echo "COPILOT_API_ENABLED=true" >> .env
   echo "COPILOT_API_URL=http://localhost:4141" >> .env
   echo "GITHUB_TOKEN=your_token" >> .env
   
   # Start BiteBase server
   npm run dev
   ```

2. **Test Integration**:
   ```bash
   # Test Copilot API directly
   curl -X POST http://localhost:4141/v1/chat/completions \
     -H "Content-Type: application/json" \
     -H "Authorization: Bearer $GITHUB_TOKEN" \
     -d '{"model":"gpt-3.5-turbo","messages":[{"role":"user","content":"Hello"}]}'
   ```

3. **Monitor Usage**:
   - Visit `http://localhost:4141/dashboard` for Copilot API metrics
   - Check server logs for integration status
   - Monitor rate limits and quotas

## Support and Troubleshooting

### Common Issues
1. **Authentication Errors**: Verify GitHub token has Copilot access
2. **Rate Limiting**: Check usage quotas and implement backoff strategies
3. **Connection Failures**: Ensure Copilot API server is running and accessible
4. **Token Expiration**: Implement token refresh mechanisms

### Debug Mode
```bash
# Enable debug logging
DEBUG=copilot-api:* npm run dev
```

### Logging Configuration
```typescript
// server/lib/logger.ts
export const logger = {
  copilot: (message: string, data?: any) => {
    if (process.env.DEBUG?.includes('copilot')) {
      console.log(`[COPILOT] ${message}`, data);
    }
  }
};
```

For more information, refer to the [copilot-api repository](https://github.com/ericc-ch/copilot-api) and test locally before deploying to production.