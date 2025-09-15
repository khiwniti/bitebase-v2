# BiteBase Intelligence - Production Deployment Guide

## Architecture Overview

This application uses a **split deployment architecture**:
- **Backend**: Cloudflare Workers (`api-beta.bitebase.app`)
- **Frontend**: Vercel (`beta.bitebase.app`)

## Prerequisites

Before deploying, ensure you have:

1. **Cloudflare Account** with domain `bitebase.app` configured
2. **Vercel Account** connected to this GitHub repository
3. **Required CLI Tools**:
   ```bash
   npm install -g wrangler vercel
   ```

## Environment Setup

### 1. Cloudflare Workers Backend

The backend is configured in `wrangler.toml` with:
- Custom domain: `api-beta.bitebase.app`
- KV storage for sessions and messages
- Environment variables stored as secrets

### 2. Vercel Frontend

The frontend is configured in `vercel.json` with:
- Custom domain: `beta.bitebase.app`
- API proxy to Cloudflare Workers backend
- Optimized Next.js settings for production

## Deployment Process

### Option 1: Automated Deployment

Run the automated deployment script:

```bash
./deploy-production-split.sh
```

This script will:
1. Check prerequisites
2. Set up Cloudflare Workers secrets
3. Deploy backend to Cloudflare Workers
4. Deploy frontend to Vercel
5. Perform health checks

### Option 2: Manual Deployment

#### Deploy Backend (Cloudflare Workers)

1. **Set up secrets**:
   ```bash
   echo "your_openai_api_key_here" | wrangler secret put OPENAI_API_KEY
   echo "your_github_token_here" | wrangler secret put GITHUB_TOKEN
   echo "bitebase-production-secret-$(date +%s)" | wrangler secret put SESSION_SECRET
   ```

2. **Deploy Workers**:
   ```bash
   wrangler deploy --env production
   ```

#### Deploy Frontend (Vercel)

1. **Build and deploy**:
   ```bash
   npm run build
   vercel --prod --confirm
   ```

## Domain Configuration

### Cloudflare (Backend)

In your Cloudflare dashboard:
1. Add `api-beta.bitebase.app` as a CNAME record pointing to your Workers domain
2. Configure SSL/TLS settings
3. Set up routing rules in `wrangler.toml`

### Vercel (Frontend)

In your Vercel dashboard:
1. Add `beta.bitebase.app` as a custom domain
2. Configure DNS settings
3. Environment variables are set via `vercel.json`

## Environment Variables

### Production Secrets

| Variable | Description | Location |
|----------|-------------|----------|
| `OPENAI_API_KEY` | OpenAI API key for AI features | Workers Secrets |
| `GITHUB_TOKEN` | GitHub token for Copilot API | Workers Secrets |
| `SESSION_SECRET` | Session encryption key | Workers Secrets |

### Public Variables

| Variable | Description | Value |
|----------|-------------|-------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | `https://api-beta.bitebase.app` |
| `NEXT_PUBLIC_APP_URL` | Frontend app URL | `https://beta.bitebase.app` |

## API Endpoints

The backend exposes these endpoints:

- **Health**: `GET /health`
- **Auth**: `GET|POST /api/auth/*`
- **Sessions**: `GET|POST|PATCH /api/sessions/*`
- **Messages**: `GET|POST|DELETE /api/messages/*`
- **CopilotKit**: `GET|POST /api/copilotkit/*`
- **Map**: `GET|PUT|POST /api/map/*`

## Features

### ✅ Working Features

- **Multi-Agent AI System**: 5 specialized research agents
- **Interactive Map**: Real-time map state synchronization
- **Chat Interface**: Session-based conversations
- **CopilotKit Integration**: AI actions and shared state
- **Real-time Updates**: WebSocket-ready architecture
- **Market Research**: Business location analysis

### 🔧 Architecture Benefits

- **Scalability**: Cloudflare Workers auto-scale globally
- **Performance**: Edge computing reduces latency
- **Reliability**: Distributed architecture with redundancy
- **Cost-Effective**: Pay-per-use pricing model

## Monitoring

### Health Checks

- **Backend**: `https://api-beta.bitebase.app/health`
- **Frontend**: `https://beta.bitebase.app`
- **CopilotKit**: `https://api-beta.bitebase.app/api/copilotkit`

### Expected Responses

```json
// Backend Health
{
  "status": "healthy",
  "timestamp": "2024-01-01T00:00:00.000Z",
  "version": "1.0.0"
}

// CopilotKit Status
{
  "status": "operational",
  "backends": {
    "openai": { "configured": true, "fallback": true }
  },
  "features": {
    "multiAgent": true,
    "mapIntegration": true,
    "marketResearch": true
  }
}
```

## Troubleshooting

### Common Issues

1. **CORS Errors**: Check that `vercel.json` has correct API proxy settings
2. **Workers Not Responding**: Verify secrets are set correctly
3. **Build Failures**: Ensure all dependencies are installed

### Debug Commands

```bash
# Check Workers deployment
wrangler tail

# Check Vercel deployment
vercel logs

# Test API endpoints
curl https://api-beta.bitebase.app/health
curl https://api-beta.bitebase.app/api/copilotkit
```

## Support

For deployment issues:
1. Check the health endpoints first
2. Review Cloudflare Workers logs
3. Check Vercel deployment logs
4. Verify DNS settings for both domains

## Security

- All API keys stored as encrypted secrets
- HTTPS enforced on all endpoints
- CORS properly configured
- Rate limiting implemented
- Input validation on all routes