// Authentication utilities for Next.js API routes
import { NextRequest } from 'next/server';
import { storage } from './storage';

interface DemoUser {
  claims: {
    sub: string;
    email: string;
  };
  username: string;
  email: string;
}

// For demo purposes, we'll create a demo user
const createDemoUser = (): DemoUser => ({
  claims: {
    sub: "demo-user-123",
    email: "demo@bitebase.ai"
  },
  username: "Demo User",
  email: "demo@bitebase.ai"
});

export async function authenticateRequest(request: NextRequest): Promise<DemoUser | null> {
  try {
    // For demo purposes, always return a demo user
    // In a real application, you would validate the session/token here
    const demoUser = createDemoUser();

    // Ensure user exists in storage
    const existingUser = await storage.getUser(demoUser.claims.sub);
    if (!existingUser) {
      // User doesn't exist, create them
      await storage.upsertUser({
        id: demoUser.claims.sub,
        email: demoUser.claims.email,
        firstName: "Demo",
        lastName: "User",
        profileImageUrl: null,
      });
    }

    return demoUser;
  } catch (error) {
    console.error("Authentication error:", error);
    return null;
  }
}

// Legacy function for Express compatibility (if needed)
export async function isAuthenticated(req: any, res?: any, next?: any) {
  if (res && next) {
    // Express middleware mode
    try {
      const demoUser = createDemoUser();
      req.session = req.session || {};
      req.session.user = demoUser;
      req.user = demoUser;

      // Ensure user exists in storage
      try {
        await storage.getUser(demoUser.claims.sub);
      } catch (error) {
        await storage.upsertUser({
          id: demoUser.claims.sub,
          email: demoUser.claims.email,
          firstName: "Demo",
          lastName: "User",
          profileImageUrl: null,
        });
      }

      next();
    } catch (error) {
      console.error("Authentication error:", error);
      res.status(500).json({ message: "Authentication failed" });
    }
  } else {
    // Next.js API route mode
    return await authenticateRequest(req as NextRequest);
  }
}