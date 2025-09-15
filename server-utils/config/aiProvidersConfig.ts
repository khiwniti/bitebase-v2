/**
 * AI Providers Configuration
 * Centralized configuration for all AI providers
 */

import type { AIProviderConfig } from '../lib/aiProviderManager';

export const AI_PROVIDERS_CONFIG: AIProviderConfig = {
  copilot: {
    enabled: process.env.COPILOT_API_ENABLED === 'true',
    baseURL: process.env.COPILOT_API_URL || 'http://localhost:4141',
    token: process.env.GITHUB_TOKEN || '',
    timeout: parseInt(process.env.COPILOT_TIMEOUT || '30000'),
    maxRetries: parseInt(process.env.COPILOT_MAX_RETRIES || '3'),
  },
  openai: {
    enabled: Boolean(process.env.OPENAI_API_KEY),
    apiKey: process.env.OPENAI_API_KEY || '',
    baseURL: process.env.OPENAI_BASE_URL || 'https://api.openai.com/v1',
  },
  anthropic: {
    enabled: Boolean(process.env.ANTHROPIC_API_KEY),
    apiKey: process.env.ANTHROPIC_API_KEY || '',
    baseURL: process.env.ANTHROPIC_BASE_URL || 'https://api.anthropic.com/v1',
  },
};

/**
 * Validate AI provider configuration
 */
export function validateAIProviderConfig(): {
  isValid: boolean;
  enabledProviders: string[];
  warnings: string[];
  errors: string[];
} {
  const warnings: string[] = [];
  const errors: string[] = [];
  const enabledProviders: string[] = [];

  // Check Copilot configuration
  if (AI_PROVIDERS_CONFIG.copilot?.enabled) {
    if (!AI_PROVIDERS_CONFIG.copilot.token) {
      errors.push('GITHUB_TOKEN is required when COPILOT_API_ENABLED=true');
    } else {
      enabledProviders.push('copilot');
    }

    if (!AI_PROVIDERS_CONFIG.copilot.baseURL) {
      warnings.push('COPILOT_API_URL not set, using default: http://localhost:4141');
    }
  }

  // Check OpenAI configuration
  if (AI_PROVIDERS_CONFIG.openai?.enabled) {
    enabledProviders.push('openai');
  }

  // Check Anthropic configuration
  if (AI_PROVIDERS_CONFIG.anthropic?.enabled) {
    enabledProviders.push('anthropic');
  }

  // Ensure at least one provider is enabled
  if (enabledProviders.length === 0) {
    warnings.push('No AI providers are enabled. Set COPILOT_API_ENABLED=true or provide API keys for other providers.');
  }

  return {
    isValid: errors.length === 0,
    enabledProviders,
    warnings,
    errors,
  };
}

/**
 * Log AI provider configuration status
 */
export function logAIProviderStatus(): void {
  const validation = validateAIProviderConfig();
  
  console.log('🤖 AI Provider Configuration Status:');
  
  if (validation.enabledProviders.length > 0) {
    console.log(`✅ Enabled providers: ${validation.enabledProviders.join(', ')}`);
  }

  if (validation.warnings.length > 0) {
    validation.warnings.forEach(warning => {
      console.warn(`⚠️  ${warning}`);
    });
  }

  if (validation.errors.length > 0) {
    validation.errors.forEach(error => {
      console.error(`❌ ${error}`);
    });
  }

  if (validation.isValid && validation.enabledProviders.length > 0) {
    console.log('✅ AI providers are properly configured');
  } else if (!validation.isValid) {
    console.log('❌ AI provider configuration has errors');
  } else {
    console.log('⚠️  No AI providers are enabled');
  }
}

/**
 * Rate limiting configuration for different providers
 */
export const RATE_LIMITS = {
  copilot: {
    requestsPerMinute: parseInt(process.env.COPILOT_RATE_LIMIT || '60'),
    requestsPerHour: parseInt(process.env.COPILOT_HOURLY_LIMIT || '1000'),
    tokensPerMinute: parseInt(process.env.COPILOT_TOKEN_LIMIT || '50000'),
  },
  openai: {
    requestsPerMinute: parseInt(process.env.OPENAI_RATE_LIMIT || '3000'),
    requestsPerHour: parseInt(process.env.OPENAI_HOURLY_LIMIT || '10000'),
    tokensPerMinute: parseInt(process.env.OPENAI_TOKEN_LIMIT || '150000'),
  },
  anthropic: {
    requestsPerMinute: parseInt(process.env.ANTHROPIC_RATE_LIMIT || '1000'),
    requestsPerHour: parseInt(process.env.ANTHROPIC_HOURLY_LIMIT || '5000'),
    tokensPerMinute: parseInt(process.env.ANTHROPIC_TOKEN_LIMIT || '100000'),
  },
};

/**
 * Model configuration for different providers
 */
export const MODEL_CONFIG = {
  copilot: {
    chat: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo'],
    embeddings: ['text-embedding-ada-002'],
    defaultChat: 'gpt-3.5-turbo',
    defaultEmbedding: 'text-embedding-ada-002',
  },
  openai: {
    chat: ['gpt-3.5-turbo', 'gpt-4', 'gpt-4-turbo', 'gpt-4-vision-preview'],
    embeddings: ['text-embedding-ada-002', 'text-embedding-3-small', 'text-embedding-3-large'],
    defaultChat: 'gpt-3.5-turbo',
    defaultEmbedding: 'text-embedding-ada-002',
  },
  anthropic: {
    chat: ['claude-3-sonnet-20240229', 'claude-3-opus-20240229', 'claude-3-haiku-20240307'],
    embeddings: [], // Anthropic doesn't provide embeddings directly
    defaultChat: 'claude-3-sonnet-20240229',
    defaultEmbedding: null,
  },
};

/**
 * Provider priority order for fallback
 */
export const PROVIDER_FALLBACK_ORDER = [
  'copilot',
  'openai', 
  'anthropic'
];

/**
 * Default generation parameters for different use cases
 */
export const DEFAULT_GENERATION_PARAMS = {
  chat: {
    temperature: 0.7,
    maxTokens: 1000,
    topP: 1.0,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
  analysis: {
    temperature: 0.3,
    maxTokens: 2000,
    topP: 0.9,
    frequencyPenalty: 0.1,
    presencePenalty: 0.1,
  },
  creative: {
    temperature: 0.9,
    maxTokens: 1500,
    topP: 0.95,
    frequencyPenalty: 0.2,
    presencePenalty: 0.3,
  },
  code: {
    temperature: 0.1,
    maxTokens: 2000,
    topP: 0.8,
    frequencyPenalty: 0,
    presencePenalty: 0,
  },
};