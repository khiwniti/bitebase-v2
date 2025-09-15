# Quick Setup Guide: GitHub Copilot API Integration

## Overview

This guide helps you set up the GitHub Copilot API integration for BiteBase Intelligence. The integration allows you to use your GitHub Copilot subscription as an AI backend for the application.

## Prerequisites

1. **GitHub Copilot Subscription**: Individual ($10/month), Business ($19/user/month), or Enterprise
2. **GitHub Personal Access Token**: With Copilot access permissions
3. **Node.js/Bun**: For running the copilot-api proxy server

## Quick Start

### Step 1: Set up Copilot API Server

```bash
# Option A: Quick test with npx (development only)
npx copilot-api@latest start

# Option B: Install and run locally (recommended)
git clone https://github.com/ericc-ch/copilot-api.git
cd copilot-api
curl -fsSL https://bun.sh/install | bash  # Install Bun
bun install
bun run auth  # Follow prompts to authenticate
bun run start --port 4141
```

### Step 2: Configure BiteBase Server

Update your `.env` file:

```bash
# Enable Copilot API integration
COPILOT_API_ENABLED=true
COPILOT_API_URL=http://localhost:4141
GITHUB_TOKEN=ghp_your_github_token_here

# Optional: Configure fallback providers
OPENAI_API_KEY=sk-your-openai-key-here
ANTHROPIC_API_KEY=sk-ant-your-anthropic-key-here
```

### Step 3: Start BiteBase Server

```bash
npm run dev
```

## Testing the Integration

### 1. Check Provider Status

```bash
curl http://localhost:5000/api/ai/health
```

Expected response:
```json
{
  "success": true,
  "overallHealth": "healthy",
  "providers": {
    "copilot": {
      "status": "healthy",
      "timestamp": "2024-01-01T00:00:00.000Z"
    }
  }
}
```

### 2. Test Chat Completion

```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Hello, can you help me with market research?"}
    ],
    "provider": "copilot"
  }'
```

### 3. Test Simple Completion

```bash
curl -X POST http://localhost:5000/api/ai/completion \
  -H "Content-Type: application/json" \
  -d '{
    "prompt": "Analyze the restaurant market in downtown Seattle",
    "provider": "copilot",
    "useCase": "analysis"
  }'
```

### 4. Test Streaming Response

```bash
curl -X POST http://localhost:5000/api/ai/chat \
  -H "Content-Type: application/json" \
  -d '{
    "messages": [
      {"role": "user", "content": "Write a brief market analysis"}
    ],
    "provider": "copilot",
    "stream": true
  }'
```

## Available API Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/api/ai/chat` | POST | Chat completions with conversation history |
| `/api/ai/completion` | POST | Simple text completion |
| `/api/ai/embeddings` | POST | Generate text embeddings |
| `/api/ai/providers` | GET | List available providers and status |
| `/api/ai/health` | GET | Health check for all providers |
| `/api/ai/models` | GET | List available models |
| `/api/ai/test` | POST | Test provider functionality |

## Common Use Cases

### Market Research Analysis

```javascript
const response = await fetch('/api/ai/completion', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    prompt: `Analyze the restaurant market for a coffee shop in downtown Seattle. 
             Consider demographics, competition, and foot traffic.`,
    provider: 'copilot',
    useCase: 'analysis',
    maxTokens: 2000
  })
});
```

### Location Recommendations

```javascript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: [
      {
        role: 'system',
        content: 'You are a market research expert specializing in restaurant location analysis.'
      },
      {
        role: 'user',
        content: 'I want to open a family restaurant. What locations should I consider in Boston?'
      }
    ],
    provider: 'copilot',
    temperature: 0.3
  })
});
```

### Real-time Chat with Streaming

```javascript
const response = await fetch('/api/ai/chat', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    messages: conversationHistory,
    provider: 'copilot',
    stream: true
  })
});

const reader = response.body.getReader();
while (true) {
  const { done, value } = await reader.read();
  if (done) break;
  
  const chunk = new TextDecoder().decode(value);
  const lines = chunk.split('\n');
  
  for (const line of lines) {
    if (line.startsWith('data: ')) {
      const data = line.slice(6);
      if (data === '[DONE]') return;
      
      try {
        const parsed = JSON.parse(data);
        if (parsed.content) {
          console.log('Received:', parsed.content);
        }
      } catch (e) {
        // Handle parsing errors
      }
    }
  }
}
```

## Environment Variables Reference

### Core Configuration
- `COPILOT_API_ENABLED`: Enable/disable Copilot API integration
- `COPILOT_API_URL`: URL of the copilot-api server
- `GITHUB_TOKEN`: GitHub Personal Access Token with Copilot access

### Performance Tuning
- `COPILOT_TIMEOUT`: Request timeout in milliseconds (default: 30000)
- `COPILOT_MAX_RETRIES`: Number of retry attempts (default: 3)
- `COPILOT_RATE_LIMIT`: Requests per minute limit (default: 60)

### Fallback Providers
- `OPENAI_API_KEY`: OpenAI API key for fallback
- `ANTHROPIC_API_KEY`: Anthropic API key for fallback

## Troubleshooting

### Common Issues

1. **"Provider copilot is not available"**
   - Check if `COPILOT_API_ENABLED=true` in .env
   - Verify `GITHUB_TOKEN` is set correctly
   - Ensure copilot-api server is running on the specified URL

2. **"GitHub token is required for Copilot API"**
   - Generate a GitHub Personal Access Token
   - Ensure the token has Copilot access permissions
   - Add the token to your .env file

3. **"Copilot API error: 401 Unauthorized"**
   - Your GitHub token may be expired or invalid
   - Re-authenticate with `bun run auth` in the copilot-api directory
   - Check if your GitHub Copilot subscription is active

4. **"Rate limit exceeded"**
   - GitHub Copilot has usage quotas (300 requests/month for individual)
   - Consider upgrading to Business or Enterprise plan
   - Implement request caching or use fallback providers

5. **Connection timeout errors**
   - Increase `COPILOT_TIMEOUT` value
   - Check network connectivity to the copilot-api server
   - Verify the copilot-api server is responding

### Debug Mode

Enable debug logging:

```bash
DEBUG=copilot-api:* npm run dev
```

### Health Check Script

Create a simple health check script:

```bash
#!/bin/bash
echo "Checking Copilot API server..."
curl -f http://localhost:4141/v1/models > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ Copilot API server is running"
else
    echo "❌ Copilot API server is not responding"
    exit 1
fi

echo "Checking BiteBase AI integration..."
curl -f http://localhost:5000/api/ai/health > /dev/null 2>&1
if [ $? -eq 0 ]; then
    echo "✅ BiteBase AI integration is working"
else
    echo "❌ BiteBase AI integration is not working"
    exit 1
fi
```

## Production Deployment

For production deployment, see the full [Server README](./README.md) which includes:
- Docker containerization
- Environment variable management
- Security considerations
- Monitoring and scaling
- Rate limiting and fallback strategies

## Getting Help

1. **Copilot API Issues**: Check the [copilot-api repository](https://github.com/ericc-ch/copilot-api)
2. **BiteBase Integration**: Check server logs and API health endpoints
3. **GitHub Copilot**: Verify your subscription status in GitHub settings

## Next Steps

1. Test the integration with the provided curl commands
2. Integrate AI calls into your frontend components
3. Set up monitoring and logging for production use
4. Configure fallback providers for reliability
5. Implement caching to reduce API calls and costs