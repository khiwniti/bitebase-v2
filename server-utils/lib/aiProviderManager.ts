/**
 * AI Provider Manager
 * Manages multiple AI providers with fallback support
 */

import { CopilotAPIProvider, type CopilotMessage } from '../providers/copilotProvider';

export interface AIProviderConfig {
  copilot?: {
    enabled: boolean;
    baseURL: string;
    token: string;
    timeout?: number;
    maxRetries?: number;
  };
  openai?: {
    enabled: boolean;
    apiKey: string;
    baseURL?: string;
  };
  anthropic?: {
    enabled: boolean;
    apiKey: string;
    baseURL?: string;
  };
}

export interface GenerationOptions {
  provider?: 'copilot' | 'openai' | 'anthropic' | 'auto';
  model?: string;
  temperature?: number;
  maxTokens?: number;
  stream?: boolean;
  systemPrompt?: string;
}

export interface GenerationResult {
  content: string;
  provider: string;
  model: string;
  usage?: {
    promptTokens: number;
    completionTokens: number;
    totalTokens: number;
  };
}

export class AIProviderManager {
  private providers: Map<string, any> = new Map();
  private config: AIProviderConfig;
  private fallbackOrder: string[] = ['copilot', 'openai', 'anthropic'];

  constructor(config: AIProviderConfig) {
    this.config = config;
    this.initializeProviders();
  }

  private initializeProviders() {
    // Initialize Copilot API if enabled
    if (this.config.copilot?.enabled && this.config.copilot.token) {
      try {
        const copilotProvider = new CopilotAPIProvider(
          this.config.copilot.baseURL,
          this.config.copilot.token,
          {
            timeout: this.config.copilot.timeout,
            maxRetries: this.config.copilot.maxRetries,
          }
        );
        this.providers.set('copilot', copilotProvider);
        console.log('✅ Copilot API provider initialized');
      } catch (error) {
        console.warn('⚠️ Failed to initialize Copilot API provider:', error);
      }
    }

    // Initialize OpenAI if enabled
    if (this.config.openai?.enabled && this.config.openai.apiKey) {
      // Note: You would implement OpenAI provider here
      console.log('✅ OpenAI provider configuration ready');
    }

    // Initialize Anthropic if enabled
    if (this.config.anthropic?.enabled && this.config.anthropic.apiKey) {
      // Note: You would implement Anthropic provider here
      console.log('✅ Anthropic provider configuration ready');
    }

    console.log(`🤖 AI Provider Manager initialized with ${this.providers.size} providers`);
  }

  /**
   * Generate text completion using specified or auto-selected provider
   */
  async generateCompletion(
    prompt: string,
    options: GenerationOptions = {}
  ): Promise<GenerationResult> {
    const messages: CopilotMessage[] = [];
    
    // Add system prompt if provided
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    return this.generateChatCompletion(messages, options);
  }

  /**
   * Generate chat completion with conversation history
   */
  async generateChatCompletion(
    messages: CopilotMessage[],
    options: GenerationOptions = {}
  ): Promise<GenerationResult> {
    const targetProvider = options.provider || 'auto';
    
    if (targetProvider === 'auto') {
      return this.generateWithFallback(messages, options);
    }

    const provider = this.providers.get(targetProvider);
    if (!provider) {
      throw new Error(`Provider ${targetProvider} is not available`);
    }

    return this.executeGeneration(provider, targetProvider, messages, options);
  }

  /**
   * Stream completion with real-time chunks
   */
  async streamCompletion(
    prompt: string,
    onChunk: (chunk: string) => void,
    options: GenerationOptions = {}
  ): Promise<void> {
    const messages: CopilotMessage[] = [];
    
    if (options.systemPrompt) {
      messages.push({ role: 'system', content: options.systemPrompt });
    }
    
    messages.push({ role: 'user', content: prompt });

    const targetProvider = options.provider || 'copilot';
    const provider = this.providers.get(targetProvider);
    
    if (!provider || !provider.streamChatCompletion) {
      throw new Error(`Streaming not supported for provider ${targetProvider}`);
    }

    await provider.streamChatCompletion(messages, {
      model: options.model,
      temperature: options.temperature,
      max_tokens: options.maxTokens,
    }, onChunk);
  }

  /**
   * Generate with automatic fallback to other providers
   */
  private async generateWithFallback(
    messages: CopilotMessage[],
    options: GenerationOptions
  ): Promise<GenerationResult> {
    let lastError: Error | null = null;

    for (const providerName of this.fallbackOrder) {
      const provider = this.providers.get(providerName);
      if (!provider) continue;

      try {
        console.log(`🔄 Attempting generation with ${providerName} provider`);
        return await this.executeGeneration(provider, providerName, messages, options);
      } catch (error) {
        lastError = error as Error;
        console.warn(`❌ Provider ${providerName} failed:`, (error as Error).message);
        
        // If it's a rate limit error, try next provider immediately
        if ((error as Error).message.includes('rate limit') || (error as Error).message.includes('quota')) {
          continue;
        }
        
        // For other errors, add a small delay before trying next provider
        await new Promise(resolve => setTimeout(resolve, 1000));
      }
    }

    throw new Error(`All AI providers failed. Last error: ${lastError?.message || 'Unknown error'}`);
  }

  /**
   * Execute generation with a specific provider
   */
  private async executeGeneration(
    provider: any,
    providerName: string,
    messages: CopilotMessage[],
    options: GenerationOptions
  ): Promise<GenerationResult> {
    const completionOptions = {
      model: options.model || this.getDefaultModel(providerName),
      temperature: options.temperature || 0.7,
      max_tokens: options.maxTokens || 1000,
      stream: false, // For non-streaming generation
    };

    const response = await provider.chatCompletion(messages, completionOptions);

    return {
      content: response.choices[0]?.message?.content || '',
      provider: providerName,
      model: response.model || completionOptions.model,
      usage: response.usage ? {
        promptTokens: response.usage.prompt_tokens,
        completionTokens: response.usage.completion_tokens,
        totalTokens: response.usage.total_tokens,
      } : undefined,
    };
  }

  /**
   * Get default model for each provider
   */
  private getDefaultModel(providerName: string): string {
    const defaultModels = {
      copilot: 'gpt-3.5-turbo',
      openai: 'gpt-3.5-turbo',
      anthropic: 'claude-3-sonnet-20240229',
    };
    return defaultModels[providerName as keyof typeof defaultModels] || 'gpt-3.5-turbo';
  }

  /**
   * Get health status of all providers
   */
  async getProvidersHealth(): Promise<Record<string, any>> {
    const health: Record<string, any> = {};

    for (const [name, provider] of Array.from(this.providers.entries())) {
      try {
        if (provider.healthCheck) {
          health[name] = await provider.healthCheck();
        } else if (provider.testConnection) {
          const result = await provider.testConnection();
          health[name] = {
            status: result.success ? 'healthy' : 'unhealthy',
            error: result.error,
            timestamp: new Date().toISOString(),
          };
        } else {
          health[name] = {
            status: 'unknown',
            timestamp: new Date().toISOString(),
          };
        }
      } catch (error) {
        health[name] = {
          status: 'unhealthy',
          error: (error as Error).message,
          timestamp: new Date().toISOString(),
        };
      }
    }

    return health;
  }

  /**
   * List available providers and their models
   */
  async listAvailableProviders(): Promise<Record<string, any>> {
    const providers: Record<string, any> = {};

    for (const [name, provider] of Array.from(this.providers.entries())) {
      try {
        providers[name] = {
          enabled: true,
          models: provider.listModels ? await provider.listModels() : [],
        };
      } catch (error) {
        providers[name] = {
          enabled: false,
          error: (error as Error).message,
        };
      }
    }

    return providers;
  }

  /**
   * Generate embeddings using available provider
   */
  async generateEmbeddings(
    input: string | string[],
    options: { provider?: string; model?: string } = {}
  ): Promise<number[][]> {
    const targetProvider = options.provider || 'copilot';
    const provider = this.providers.get(targetProvider);

    if (!provider || !provider.embeddings) {
      throw new Error(`Embeddings not supported for provider ${targetProvider}`);
    }

    const response = await provider.embeddings(input, options.model);
    return response.data?.map((item: any) => item.embedding) || [];
  }

  /**
   * Update provider configuration at runtime
   */
  updateProviderConfig(providerName: string, config: any): void {
    if (providerName === 'copilot' && config.enabled) {
      try {
        const copilotProvider = new CopilotAPIProvider(
          config.baseURL,
          config.token,
          {
            timeout: config.timeout,
            maxRetries: config.maxRetries,
          }
        );
        this.providers.set('copilot', copilotProvider);
        console.log('✅ Copilot provider configuration updated');
      } catch (error) {
        console.error('❌ Failed to update Copilot provider:', (error as Error).message);
        throw error;
      }
    }
    // Add similar logic for other providers
  }

  /**
   * Get provider statistics
   */
  getProviderStats(): Record<string, any> {
    const stats: Record<string, any> = {};
    
    for (const [name] of Array.from(this.providers.entries())) {
      stats[name] = {
        enabled: true,
        lastUsed: null, // You would track this in a real implementation
        totalRequests: 0, // You would track this in a real implementation
        successRate: 0, // You would calculate this based on success/failure tracking
      };
    }

    return stats;
  }
}

// Create singleton instance
let aiProviderManager: AIProviderManager | null = null;

export function createAIProviderManager(config: AIProviderConfig): AIProviderManager {
  if (!aiProviderManager) {
    aiProviderManager = new AIProviderManager(config);
  }
  return aiProviderManager;
}

export function getAIProviderManager(): AIProviderManager {
  if (!aiProviderManager) {
    throw new Error('AI Provider Manager not initialized. Call createAIProviderManager first.');
  }
  return aiProviderManager;
}