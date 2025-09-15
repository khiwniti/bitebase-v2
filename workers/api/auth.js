import { Router } from 'itty-router';
import { createResponse, checkRateLimit } from '../src/utils';

const router = Router({ base: '/api/auth' });

// Demo user for development
const DEMO_USER = {
  id: 'demo-user',
  email: 'demo@bitebase.app',
  name: 'Demo User',
  avatar: null,
  createdAt: new Date().toISOString(),
  lastLoginAt: new Date().toISOString(),
};

// GET /api/auth/user - Get current user
router.get('/user', async (request) => {
  try {
    // Rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!await checkRateLimit(request.env, `auth:${clientIP}`, 60, 60)) {
      return createResponse(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    // In production, verify JWT token here
    const authHeader = request.headers.get('Authorization');
    if (!authHeader) {
      return createResponse(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    // For demo purposes, return demo user
    return createResponse({
      user: DEMO_USER,
      authenticated: true,
      timestamp: new Date().toISOString()
    });

  } catch (error) {
    console.error('Auth error:', error);
    return createResponse(
      { error: 'Authentication failed', message: error.message },
      { status: 500 }
    );
  }
});

// POST /api/auth/login - Login (demo)
router.post('/login', async (request) => {
  try {
    const body = await request.json();
    const { email, password } = body;

    // Rate limiting
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!await checkRateLimit(request.env, `login:${clientIP}`, 10, 300)) {
      return createResponse(
        { error: 'Too many login attempts' },
        { status: 429 }
      );
    }

    // Demo login - accept any credentials
    if (email && password) {
      return createResponse({
        user: DEMO_USER,
        token: `demo-token-${Date.now()}`,
        authenticated: true,
        message: 'Login successful'
      });
    }

    return createResponse(
      { error: 'Invalid credentials' },
      { status: 401 }
    );

  } catch (error) {
    console.error('Login error:', error);
    return createResponse(
      { error: 'Login failed', message: error.message },
      { status: 500 }
    );
  }
});

// POST /api/auth/logout - Logout
router.post('/logout', async (request) => {
  try {
    return createResponse({
      message: 'Logout successful',
      authenticated: false,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Logout error:', error);
    return createResponse(
      { error: 'Logout failed', message: error.message },
      { status: 500 }
    );
  }
});

export const authRoutes = router;