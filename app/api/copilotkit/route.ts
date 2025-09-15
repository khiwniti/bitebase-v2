import { NextRequest, NextResponse } from 'next/server'
import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNextJSAppRouterEndpoint } from '@copilotkit/runtime'

// GitHub Copilot API adapter for production use
class GitHubCopilotAdapter {
  private githubToken: string;
  private copilotApiUrl: string;

  constructor(githubToken: string, copilotApiUrl: string = 'http://localhost:4141') {
    this.githubToken = githubToken;
    this.copilotApiUrl = copilotApiUrl;
  }

  async getResponse(params: any) {
    try {
      const response = await fetch(`${this.copilotApiUrl}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.githubToken}`
        },
        body: JSON.stringify({
          model: 'gpt-4',
          messages: params.messages,
          temperature: params.temperature || 0.7,
          max_tokens: params.max_tokens || 4000,
          stream: params.stream || false
        })
      });

      if (!response.ok) {
        throw new Error(`GitHub Copilot API error: ${response.status}`);
      }

      return await response.json();
    } catch (error) {
      console.error('GitHub Copilot API error:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.copilotApiUrl}/`, {
        headers: { 'Authorization': `Bearer ${this.githubToken}` }
      });
      return response.ok && (await response.text()).includes('Server running');
    } catch {
      return false;
    }
  }
}

export async function POST(req: NextRequest) {
  try {
    let serviceAdapter;
    
    // Try GitHub Copilot API first (production preference)
    const githubToken = process.env.GITHUB_TOKEN;
    const copilotApiUrl = process.env.COPILOT_API_URL || 'http://localhost:4141';
    
    if (githubToken) {
      const githubAdapter = new GitHubCopilotAdapter(githubToken, copilotApiUrl);
      const isHealthy = await githubAdapter.healthCheck();
      
      if (isHealthy) {
        console.log('🤖 Using GitHub Copilot API backend');
        serviceAdapter = githubAdapter;
      }
    }
    
    // Fallback to OpenAI if GitHub Copilot API is unavailable
    if (!serviceAdapter) {
      const openaiKey = process.env.OPENAI_API_KEY;
      if (!openaiKey) {
        return NextResponse.json(
          { 
            error: 'No AI service available', 
            message: 'Please configure GITHUB_TOKEN for Copilot API or OPENAI_API_KEY for OpenAI fallback',
            setup: {
              copilotApi: !!githubToken,
              openai: !!openaiKey,
              copilotApiHealthy: false
            }
          }, 
          { status: 500 }
        );
      }
      
      console.log('🔄 Using OpenAI fallback backend');
      serviceAdapter = new OpenAIAdapter({ 
        model: 'gpt-4o-mini'
      });
    }

    // Create CopilotRuntime with service adapter
    const runtime = new CopilotRuntime();
    
    // Use the proper endpoint handler
    const handler = copilotRuntimeNextJSAppRouterEndpoint({
      runtime,
      serviceAdapter,
      endpoint: req.url || '/api/copilotkit'
    });
    
    return await handler.handleRequest(req);
    
  } catch (error) {
    console.error('CopilotKit API error:', error);
    return NextResponse.json(
      { 
        error: 'AI service error', 
        details: error instanceof Error ? error.message : 'Unknown error',
        timestamp: new Date().toISOString()
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const githubToken = process.env.GITHUB_TOKEN;
  const copilotApiUrl = process.env.COPILOT_API_URL || 'http://localhost:4141';
  const openaiKey = process.env.OPENAI_API_KEY;
  
  let copilotApiHealthy = false;
  if (githubToken) {
    try {
      const response = await fetch(`${copilotApiUrl}/`, {
        headers: { 'Authorization': `Bearer ${githubToken}` },
        signal: AbortSignal.timeout(5000) // 5 second timeout
      });
      const text = await response.text();
      copilotApiHealthy = response.ok && text.includes('Server running');
    } catch {
      copilotApiHealthy = false;
    }
  }

  return NextResponse.json({ 
    status: 'CopilotKit API endpoint is running',
    endpoint: '/api/copilotkit',
    model: copilotApiHealthy ? 'GitHub Copilot (gpt-4)' : 'OpenAI (gpt-4o-mini)',
    backends: {
      copilotApi: {
        configured: !!githubToken,
        healthy: copilotApiHealthy,
        url: copilotApiUrl
      },
      openai: {
        configured: !!openaiKey,
        fallback: true
      }
    },
    features: ['chat', 'actions', 'agents', 'market-research', 'restaurant-analysis'],
    timestamp: new Date().toISOString()
  });
}