/**
 * API Configuration for External Services
 * Centralized configuration for all external API integrations
 */

export const API_CONFIG = {
  // Web Search API (Tavily)
  webSearch: {
    apiKey: process.env.WEB_SEARCH_API_KEY || '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',
    baseUrl: 'https://api.tavily.com/search',
    rateLimit: {
      maxRequests: 100,
      windowMs: 60 * 1000 // 100 requests per minute
    }
  },

  // Geoapify Places API
  geoapify: {
    apiKey: process.env.GEOAPIFY_API_KEY || '7b278df53c9f42148598710d37436cf5',
    baseUrl: 'https://api.geoapify.com/v2',
    rateLimit: {
      maxRequests: 3000,
      windowMs: 24 * 60 * 60 * 1000 // 3000 requests per day
    }
  },

  // Mapbox API
  mapbox: {
    apiKey: process.env.MAPBOX_API_KEY || 'pk.eyJ1Ijoia2hpd25pdGkiLCJhIjoiY205eDFwMzl0MHY1YzJscjB3bm4xcnh5ZyJ9.ANGVE0tiA9NslBn8ft_9fQ',
    baseUrl: 'https://api.mapbox.com',
    rateLimit: {
      maxRequests: 100000,
      windowMs: 24 * 60 * 60 * 1000 // 100k requests per day
    }
  }
};

// Cache TTL configurations (in milliseconds)
export const CACHE_TTL = {
  webSearch: 30 * 60 * 1000,      // 30 minutes
  places: 60 * 60 * 1000,         // 1 hour
  demographics: 24 * 60 * 60 * 1000, // 24 hours
  traffic: 15 * 60 * 1000,        // 15 minutes
  zoning: 7 * 24 * 60 * 60 * 1000 // 7 days
};

// API health check endpoints
export const HEALTH_CHECK_ENDPOINTS = {
  webSearch: () => ({
    query: 'test',
    maxResults: 1
  }),
  geoapify: () => ({
    location: 'New York',
    limit: 1
  }),
  mapbox: () => ({
    address: 'New York'
  })
};

// Error handling configuration
export const ERROR_CONFIG = {
  maxRetries: 3,
  retryDelay: 1000, // Base delay in ms
  timeoutMs: 10000  // Request timeout
};

// Validate API configuration on startup
export function validateAPIConfig(): { isValid: boolean; errors: string[] } {
  const errors: string[] = [];

  if (!API_CONFIG.webSearch.apiKey || API_CONFIG.webSearch.apiKey === 'your-api-key') {
    errors.push('Web Search API key is missing or invalid');
  }

  if (!API_CONFIG.geoapify.apiKey || API_CONFIG.geoapify.apiKey === 'your-api-key') {
    errors.push('Geoapify API key is missing or invalid');
  }

  if (!API_CONFIG.mapbox.apiKey || API_CONFIG.mapbox.apiKey === 'your-api-key') {
    errors.push('Mapbox API key is missing or invalid');
  }

  return {
    isValid: errors.length === 0,
    errors
  };
}

// Log API configuration status (without exposing keys)
export function logAPIConfigStatus(): void {
  const config = validateAPIConfig();
  
  console.log('🔧 API Configuration Status:');
  console.log(`  Web Search API: ${API_CONFIG.webSearch.apiKey ? '✅ Configured' : '❌ Missing'}`);
  console.log(`  Geoapify API: ${API_CONFIG.geoapify.apiKey ? '✅ Configured' : '❌ Missing'}`);
  console.log(`  Mapbox API: ${API_CONFIG.mapbox.apiKey ? '✅ Configured' : '❌ Missing'}`);
  
  if (!config.isValid) {
    console.warn('⚠️ API Configuration Issues:');
    config.errors.forEach(error => console.warn(`  - ${error}`));
  } else {
    console.log('✅ All APIs properly configured');
  }
}
