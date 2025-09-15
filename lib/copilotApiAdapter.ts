// Custom adapter for copilot-api integration
// This adapter provides OpenAI-compatible API endpoints using GitHub Copilot

interface CopilotAPIConfig {
  baseURL: string;
  apiKey: string;
  model?: string;
}

interface ChatMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface ChatCompletion {
  model: string;
  messages: ChatMessage[];
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
}

export class CopilotAPIAdapter {
  private config: CopilotAPIConfig;

  constructor(config: CopilotAPIConfig) {
    this.config = {
      baseURL: config.baseURL || 'http://localhost:4141',
      apiKey: config.apiKey,
      model: config.model || 'gpt-4'
    };
  }

  async createChatCompletion(params: ChatCompletion) {
    try {
      const response = await fetch(`${this.config.baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.config.apiKey}`
        },
        body: JSON.stringify({
          model: params.model || this.config.model,
          messages: params.messages,
          temperature: params.temperature || 0.7,
          max_tokens: params.max_tokens || 4000,
          stream: params.stream || false
        })
      });

      if (!response.ok) {
        throw new Error(`Copilot API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('CopilotAPI adapter error:', error);
      throw error;
    }
  }

  async listModels() {
    try {
      const response = await fetch(`${this.config.baseURL}/v1/models`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      if (!response.ok) {
        throw new Error(`Copilot API error: ${response.status} ${response.statusText}`);
      }

      return await response.json();
    } catch (error) {
      console.error('CopilotAPI models error:', error);
      throw error;
    }
  }

  async healthCheck() {
    try {
      const response = await fetch(`${this.config.baseURL}/health`, {
        headers: {
          'Authorization': `Bearer ${this.config.apiKey}`
        }
      });

      return response.ok;
    } catch (error) {
      console.error('CopilotAPI health check failed:', error);
      return false;
    }
  }
}

// Factory function to create adapter based on environment
export function createCopilotAdapter(): CopilotAPIAdapter | null {
  const githubToken = process.env.GITHUB_TOKEN;
  const copilotApiUrl = process.env.COPILOT_API_URL || 'http://localhost:4141';

  if (!githubToken) {
    console.warn('GitHub token not found. CopilotAPI adapter not available.');
    return null;
  }

  return new CopilotAPIAdapter({
    baseURL: copilotApiUrl,
    apiKey: githubToken,
    model: 'gpt-4'
  });
}

export default CopilotAPIAdapter;