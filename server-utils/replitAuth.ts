// Simple session-based authentication (no external auth required)

import session from "express-session";
import type { Express, RequestHandler } from "express";
import MemoryStore from "memorystore";
import { storage } from "./storage";
import passport from "passport";

async function getOidcConfig() {
  return {};
}

class Strategy {
  constructor(options: any, verify: any) {}
  authenticate() {}
}

const client = {
  buildEndSessionUrl(config: any, options: any) {
    return { href: '' };
  },
  async refreshTokenGrant(config: any, refreshToken: string) {
    return {};
  }
};

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
        firstName: demoUser.claims.name?.split(' ')[0] || 'Demo',
        lastName: demoUser.claims.name?.split(' ')[1] || 'User',
        email: demoUser.claims.email,
      });
    }

    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(500).json({ message: "Authentication failed" });
  }
};

export async function setupAuth(app: Express) {
  // Setup session middleware
  app.use(getSession() as any);
  
  console.log("✅ Simple session authentication configured");
}

function updateUserSession(
  user: any,
  tokens: any
) {
  user.claims = tokens.claims();
  user.access_token = tokens.access_token;
  user.refresh_token = tokens.refresh_token;
  user.expires_at = user.claims?.exp;
}

async function upsertUser(
  claims: any,
) {
  await storage.upsertUser({
    id: claims["sub"],
    email: claims["email"],
    firstName: claims["first_name"],
    lastName: claims["last_name"],
    profileImageUrl: claims["profile_image_url"],
  });
}

export async function setupAuthWithOAuth(app: Express) {
  app.set("trust proxy", 1);
  app.use(getSession() as any);
  app.use(passport.initialize() as any);
  app.use(passport.session() as any);

  const config = await getOidcConfig();

  const verify: any = async (
    tokens: any,
    verified: any
  ) => {
    const user = {};
    updateUserSession(user, tokens);
    await upsertUser(tokens.claims());
    verified(null, user);
  };

  for (const domain of process.env
    .REPLIT_DOMAINS!.split(",")) {
    const strategy = new Strategy(
      {
        name: `replitauth:${domain}`,
        config,
        scope: "openid email profile offline_access",
        callbackURL: `https://${domain}/api/callback`,
      },
      verify,
    );
    passport.use(strategy);
  }

  passport.serializeUser((user: Express.User, cb) => cb(null, user));
  passport.deserializeUser((user: Express.User, cb) => cb(null, user));

  app.get("/api/login", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      prompt: "login consent",
      scope: ["openid", "email", "profile", "offline_access"],
    })(req, res, next);
  });

  app.get("/api/callback", (req, res, next) => {
    passport.authenticate(`replitauth:${req.hostname}`, {
      successReturnToOrRedirect: "/",
      failureRedirect: "/api/login",
    })(req, res, next);
  });

  app.get("/api/logout", (req, res) => {
    req.logout(() => {
      res.redirect(
        client.buildEndSessionUrl(config, {
          client_id: process.env.REPL_ID!,
          post_logout_redirect_uri: `${req.protocol}://${req.hostname}`,
        }).href
      );
    });
  });
}

export const isAuthenticatedWithRefresh: RequestHandler = async (req, res, next) => {
  const user = req.user as any;

  if (!req.isAuthenticated() || !user.expires_at) {
    return res.status(401).json({ message: "Unauthorized" });
  }

  const now = Math.floor(Date.now() / 1000);
  if (now <= user.expires_at) {
    return next();
  }

  const refreshToken = user.refresh_token;
  if (!refreshToken) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }

  try {
    const config = await getOidcConfig();
    const tokenResponse = await client.refreshTokenGrant(config, refreshToken);
    updateUserSession(user, tokenResponse);
    return next();
  } catch (error) {
    res.status(401).json({ message: "Unauthorized" });
    return;
  }
};
