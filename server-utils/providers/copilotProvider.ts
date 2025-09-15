/**
 * GitHub Copilot API Provider
 * Provides integration with the copilot-api reverse-engineered proxy
 */

interface CopilotMessage {
  role: 'system' | 'user' | 'assistant';
  content: string;
}

interface CopilotCompletionOptions {
  model?: string;
  temperature?: number;
  max_tokens?: number;
  stream?: boolean;
  top_p?: number;
  frequency_penalty?: number;
  presence_penalty?: number;
}

interface CopilotResponse {
  id: string;
  object: string;
  created: number;
  model: string;
  choices: Array<{
    index: number;
    message: {
      role: string;
      content: string;
    };
    finish_reason: string;
  }>;
  usage: {
    prompt_tokens: number;
    completion_tokens: number;
    total_tokens: number;
  };
}

export class CopilotAPIProvider {
  private baseURL: string;
  private githubToken: string;
  private timeout: number;
  private maxRetries: number;

  constructor(
    baseURL = 'http://localhost:4141',
    githubToken: string,
    options: { timeout?: number; maxRetries?: number } = {}
  ) {
    this.baseURL = baseURL.replace(/\/$/, ''); // Remove trailing slash
    this.githubToken = githubToken;
    this.timeout = options.timeout || 30000; // 30 seconds default
    this.maxRetries = options.maxRetries || 3;

    if (!githubToken) {
      throw new Error('GitHub token is required for Copilot API');
    }
  }

  /**
   * Generate chat completion using Copilot API
   */
  async chatCompletion(
    messages: CopilotMessage[],
    options: CopilotCompletionOptions = {}
  ): Promise<CopilotResponse> {
    const requestBody = {
      model: options.model || 'gpt-3.5-turbo',
      messages,
      temperature: options.temperature || 0.7,
      max_tokens: options.max_tokens || 1000,
      stream: options.stream || false,
      top_p: options.top_p,
      frequency_penalty: options.frequency_penalty,
      presence_penalty: options.presence_penalty,
    };

    // Remove undefined values
    Object.keys(requestBody).forEach(key => {
      if ((requestBody as any)[key] === undefined) {
        delete (requestBody as any)[key];
      }
    });

    return this.makeRequest('/v1/chat/completions', {
      method: 'POST',
      body: JSON.stringify(requestBody),
    });
  }

  /**
   * Generate embeddings using Copilot API
   */
  async embeddings(input: string | string[], model = 'text-embedding-ada-002') {
    return this.makeRequest('/v1/embeddings', {
      method: 'POST',
      body: JSON.stringify({
        model,
        input,
      }),
    });
  }

  /**
   * List available models
   */
  async listModels() {
    return this.makeRequest('/v1/models', {
      method: 'GET',
    });
  }

  /**
   * Get server health status
   */
  async healthCheck(): Promise<{ status: string; timestamp: string }> {
    try {
      const response = await this.makeRequest('/health', {
        method: 'GET',
      }, false); // Don't retry health checks
      return {
        status: 'healthy',
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
      };
    }
  }

  /**
   * Stream chat completion
   */
  async streamChatCompletion(
    messages: CopilotMessage[],
    options: CopilotCompletionOptions = {},
    onChunk: (chunk: string) => void
  ): Promise<void> {
    const requestBody = {
      ...options,
      messages,
      stream: true,
      model: options.model || 'gpt-3.5-turbo',
    };

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeout);

    try {
      const response = await fetch(`${this.baseURL}/v1/chat/completions`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${this.githubToken}`,
          'Accept': 'text/event-stream',
        },
        body: JSON.stringify(requestBody),
        signal: controller.signal,
      });

      if (!response.ok) {
        throw new Error(`Copilot API error: ${response.status} ${response.statusText}`);
      }

      const reader = response.body?.getReader();
      if (!reader) {
        throw new Error('Failed to get response reader');
      }

      while (true) {
        const { done, value } = await reader.read();
        if (done) break;

        const chunk = new TextDecoder().decode(value);
        const lines = chunk.split('\n').filter(line => line.trim());

        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            if (data === '[DONE]') {
              return;
            }

            try {
              const parsed = JSON.parse(data);
              const content = parsed.choices?.[0]?.delta?.content;
              if (content) {
                onChunk(content);
              }
            } catch (error) {
              console.warn('Failed to parse streaming chunk:', error);
            }
          }
        }
      }
    } finally {
      clearTimeout(timeoutId);
    }
  }

  /**
   * Make HTTP request with retry logic
   */
  private async makeRequest(
    endpoint: string,
    options: RequestInit,
    shouldRetry = true
  ): Promise<any> {
    const url = `${this.baseURL}${endpoint}`;
    let lastError: Error;

    const maxAttempts = shouldRetry ? this.maxRetries : 1;

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        const controller = new AbortController();
        const timeoutId = setTimeout(() => controller.abort(), this.timeout);

        const response = await fetch(url, {
          ...options,
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${this.githubToken}`,
            ...options.headers,
          },
          signal: controller.signal,
        });

        clearTimeout(timeoutId);

        if (!response.ok) {
          const errorBody = await response.text().catch(() => 'Unknown error');
          throw new Error(`Copilot API error: ${response.status} ${response.statusText} - ${errorBody}`);
        }

        return await response.json();
      } catch (error) {
        lastError = error as Error;
        
        if (attempt === maxAttempts || !shouldRetry) {
          throw lastError;
        }

        // Exponential backoff
        const delay = Math.min(1000 * Math.pow(2, attempt - 1), 10000);
        console.warn(`Copilot API request failed (attempt ${attempt}/${maxAttempts}), retrying in ${delay}ms:`, (error as Error).message);
        await new Promise(resolve => setTimeout(resolve, delay));
      }
    }

    throw lastError!;
  }

  /**
   * Test the connection to Copilot API
   */
  async testConnection(): Promise<{ success: boolean; error?: string; models?: any[] }> {
    try {
      const models = await this.listModels();
      return {
        success: true,
        models: models.data || [],
      };
    } catch (error) {
      return {
        success: false,
        error: (error as Error).message,
      };
    }
  }
}

// Export types for use in other files
export type { CopilotMessage, CopilotCompletionOptions, CopilotResponse };