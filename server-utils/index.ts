import dotenv from "dotenv";
dotenv.config();

import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { logAPIConfigStatus, validateAPIConfig } from "./config/apiConfig";
import { createAIProviderManager } from "./lib/aiProviderManager";
import { AI_PROVIDERS_CONFIG, logAIProviderStatus } from "./config/aiProvidersConfig";

// Startup timing for performance monitoring
const startTime = Date.now();
const isDevelopment = process.env.NODE_ENV === "development";
const isFastDev = process.env.FAST_DEV === "true";
const skipValidations = process.env.SKIP_VALIDATIONS === "true";

if (isDevelopment) {
  console.log(`🚀 Starting BiteBase Intelligence server (${isFastDev ? 'TURBO ' : ''}development mode)...`);
} else {
  console.log("🚀 Starting BiteBase Intelligence server...");
}

function logTiming(step: string) {
  const elapsed = Date.now() - startTime;
  console.log(`⏱️  ${step}: ${elapsed}ms`);
}

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

logTiming("Express app initialized");

// In development, skip some validations for faster startup
if (skipValidations || isFastDev) {
  console.log("🔧 TURBO mode: skipping all validations for fastest startup");
} else if (isDevelopment) {
  console.log("🔧 Development mode: skipping full API validation for faster startup");
} else {
  // Validate API configuration
  logAPIConfigStatus();
  const apiConfig = validateAPIConfig();
  if (!apiConfig.isValid) {
    console.warn("⚠️ Some external APIs may not function properly due to missing configuration");
  }
}

// Initialize AI Provider Manager (lazy in development)
if (skipValidations || isFastDev) {
  console.log("🤖 TURBO mode: AI providers skipped for fastest startup");
} else if (isDevelopment) {
  console.log("🤖 Development mode: AI providers will be initialized on first use");
} else {
  logAIProviderStatus();
  const aiProviderManager = createAIProviderManager(AI_PROVIDERS_CONFIG);
  logTiming("AI providers initialized");
}

app.use((req, res, next) => {
  const start = Date.now();
  const path = req.path;
  let capturedJsonResponse: Record<string, any> | undefined = undefined;

  const originalResJson = res.json;
  res.json = function (bodyJson, ...args) {
    capturedJsonResponse = bodyJson;
    return originalResJson.apply(res, [bodyJson, ...args]);
  };

  res.on("finish", () => {
    const duration = Date.now() - start;
    if (path.startsWith("/api")) {
      let logLine = `${req.method} ${path} ${res.statusCode} in ${duration}ms`;
      if (capturedJsonResponse) {
        logLine += ` :: ${JSON.stringify(capturedJsonResponse)}`;
      }

      if (logLine.length > 80) {
        logLine = logLine.slice(0, 79) + "…";
      }

      console.log(logLine);
    }
  });

  next();
});

(async () => {
  try {
    logTiming("Starting route registration");
    const server = await registerRoutes(app);
    logTiming("Routes registered");

    app.use((err: any, _req: Request, res: Response, _next: NextFunction) => {
      const status = err.status || err.statusCode || 500;
      const message = err.message || "Internal Server Error";

      res.status(status).json({ message });
      throw err;
    });

    // importantly only setup vite in development and after
    // setting up all the other routes so the catch-all route
    // doesn't interfere with the other routes
    if (app.get("env") === "development") {
      console.log("Starting static file serving");
      app.use(express.static('public'));
    }

    // ALWAYS serve the app on the port specified in the environment variable PORT
    // Other ports are firewalled. Default to 5000 if not specified.
    // this serves both the API and the client.
    // It is the only port that is not firewalled.
    const port = parseInt(process.env.PORT || '5000', 10);
    server.listen({
      port,
      host: "0.0.0.0",
      reusePort: true,
    }, () => {
      const totalTime = Date.now() - startTime;
      console.log(`🎉 Server ready on port ${port} (startup took ${totalTime}ms)`);
    });
  } catch (error) {
    console.error("❌ Server startup failed:", error);
    process.exit(1);
  }
})();
