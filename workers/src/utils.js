// CORS handling for Workers
export function handleCORS(request) {
  if (request.method === 'OPTIONS') {
    return new Response(null, {
      status: 204,
      headers: {
        'Access-Control-Allow-Origin': '*',
        'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
        'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
        'Access-Control-Max-Age': '86400',
      },
    });
  }
}

// Create standardized response with CORS headers
export function createResponse(data, options = {}) {
  const { status = 200, headers = {} } = options;
  
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, PUT, DELETE, PATCH, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Authorization, X-Requested-With',
      ...headers,
    },
  });
}

// Database connection helper for D1 or external PostgreSQL
export async function getDatabase(env) {
  if (env.DB) {
    // Using Cloudflare D1
    return env.DB;
  } else if (env.DATABASE_URL) {
    // Using external PostgreSQL (would need a connection adapter)
    throw new Error('External PostgreSQL not yet implemented in this Workers setup');
  } else {
    throw new Error('No database configuration found');
  }
}

// Session management helper
export async function getSession(env, sessionId) {
  if (env.SESSION_STORE) {
    // Using Durable Object
    const id = env.SESSION_STORE.idFromName(sessionId);
    const stub = env.SESSION_STORE.get(id);
    const response = await stub.fetch(`https://fake-url/${sessionId}`);
    return await response.json();
  }
  
  // Fallback to KV or database
  if (env.CACHE) {
    const session = await env.CACHE.get(`session:${sessionId}`);
    return session ? JSON.parse(session) : null;
  }
  
  return null;
}

// Rate limiting helper
export async function checkRateLimit(env, identifier, limit = 60, window = 60) {
  if (!env.CACHE) return true;
  
  const key = `ratelimit:${identifier}`;
  const current = await env.CACHE.get(key);
  const count = current ? parseInt(current) : 0;
  
  if (count >= limit) {
    return false;
  }
  
  await env.CACHE.put(key, (count + 1).toString(), { expirationTtl: window });
  return true;
}

// Error handling middleware
export function handleError(error) {
  console.error('API Error:', error);
  
  if (error.name === 'ValidationError') {
    return createResponse(
      { error: 'Validation Error', message: error.message },
      { status: 400 }
    );
  }
  
  if (error.name === 'UnauthorizedError') {
    return createResponse(
      { error: 'Unauthorized', message: 'Authentication required' },
      { status: 401 }
    );
  }
  
  return createResponse(
    { error: 'Internal Server Error', message: 'An unexpected error occurred' },
    { status: 500 }
  );
}

// JWT token verification (simplified)
export async function verifyToken(token, secret) {
  try {
    // In a real implementation, use a proper JWT library
    // For now, just basic validation
    if (!token || !token.startsWith('Bearer ')) {
      throw new Error('Invalid token format');
    }
    
    return { valid: true, userId: 'demo-user' };
  } catch (error) {
    return { valid: false, error: error.message };
  }
}