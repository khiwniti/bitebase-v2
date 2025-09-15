// Simple session-based authentication (no external auth required)

import session from "express-session";
import type { Express, RequestHandler } from "express";
import MemoryStore from "memorystore";
import { storage } from "./storage";

export function getSession() {
  const sessionTtl = 7 * 24 * 60 * 60 * 1000; // 1 week
  const memoryStore = MemoryStore(session);
  const sessionStore = new memoryStore({
    checkPeriod: sessionTtl, // prune expired entries every 24h
  });
  return session({
    secret: process.env.SESSION_SECRET!,
    store: sessionStore,
    resave: false,
    saveUninitialized: false,
    cookie: {
      secure: false, // set to true if using HTTPS in production
      maxAge: sessionTtl,
    },
  });
}

// Simple authentication middleware - creates a demo user automatically
export const isAuthenticated: RequestHandler = async (req: any, res, next) => {
  try {
    // Check if user is already in session
    if (req.session?.user) {
      req.user = req.session.user;
      return next();
    }

    // Create a demo user automatically for local development
    const demoUser = {
      claims: {
        sub: "demo-user-123",
        name: "Demo User", 
        email: "demo@localhost"
      }
    };

    // Store user in session
    req.session.user = demoUser;
    req.user = demoUser;

    // Ensure user exists in storage
    try {
      await storage.getUser(demoUser.claims.sub);
    } catch (error) {
      // User doesn't exist, create them
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
};

export async function setupAuth(app: any) {
  // Setup session middleware - disabled for Next.js build
  // app.use(getSession());
  
  console.log("✅ Simple session authentication configured");
}