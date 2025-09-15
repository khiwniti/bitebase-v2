// Enhanced CopilotKit endpoint with copilot-api fallback
import { NextRequest, NextResponse } from 'next/server'
import { CopilotRuntime, OpenAIAdapter, copilotRuntimeNextJSAppRouterEndpoint } from '@copilotkit/runtime'
import { CopilotAPIAdapter, createCopilotAdapter } from '@/lib/copilotApiAdapter'

class CustomCopilotAdapter {
  private openaiAdapter?: OpenAIAdapter;
  private copilotApiAdapter?: CopilotAPIAdapter;

  constructor() {
    // Initialize OpenAI adapter if key is available
    if (process.env.OPENAI_API_KEY) {
      this.openaiAdapter = new OpenAIAdapter({ 
        model: 'gpt-4o-mini'
      });
    }

    // Initialize copilot-api adapter if GitHub token is available
    this.copilotApiAdapter = createCopilotAdapter();
  }

  async getAdapter() {
    // Prefer copilot-api if available and healthy
    if (this.copilotApiAdapter) {
      const isHealthy = await this.copilotApiAdapter.healthCheck();
      if (isHealthy) {
        console.log('Using copilot-api backend');
        return this.createCopilotKitAdapter();
      }
    }

    // Fallback to OpenAI
    if (this.openaiAdapter) {
      console.log('Using OpenAI backend');
      return this.openaiAdapter;
    }

    throw new Error('No valid API adapter available');
  }

  private createCopilotKitAdapter() {
    // Create a CopilotKit-compatible adapter using copilot-api
    return {
      getResponse: async (params: any) => {
        if (!this.copilotApiAdapter) {
          throw new Error('Copilot API adapter not available');
        }

        const completion = await this.copilotApiAdapter.createChatCompletion({
          model: 'gpt-4',
          messages: params.messages,
          temperature: params.temperature,
          max_tokens: params.max_tokens,
          stream: params.stream
        });

        return completion;
      }
    };
  }
}

export async function POST(req: NextRequest) {
  try {
    const adapterManager = new CustomCopilotAdapter();
    const serviceAdapter = await adapterManager.getAdapter();

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
        error: 'AI service unavailable', 
        details: error instanceof Error ? error.message : 'Unknown error',
        fallback: 'Please check if API keys are configured or copilot-api server is running'
      },
      { status: 500 }
    );
  }
}

export async function GET(req: NextRequest) {
  const adapterManager = new CustomCopilotAdapter();
  
  try {
    await adapterManager.getAdapter();
    return NextResponse.json({ 
      status: 'CopilotKit API endpoint is running',
      endpoint: '/api/copilotkit',
      backends: {
        copilotApi: !!process.env.GITHUB_TOKEN,
        openai: !!process.env.OPENAI_API_KEY
      },
      features: ['chat', 'actions', 'agents', 'market-research']
    });
  } catch (error) {
    return NextResponse.json(
      { 
        status: 'No API backends available',
        error: error instanceof Error ? error.message : 'Unknown error',
        setup: 'Configure GITHUB_TOKEN or OPENAI_API_KEY environment variables'
      },
      { status: 503 }
    );
  }
}