import express, { type Request, Response, NextFunction } from "express";
import { registerRoutes } from "./routes";
import { setupVite, serveStatic, log } from "./vite";
import { config, validateConfig } from "./config";
import { startNgrok } from "./ngrok";

const app = express();
app.use(express.json());
app.use(express.urlencoded({ extended: false }));

// Use request logger middleware
app.use(require('./middleware/requestLogger').requestLogger);

(async () => {
  const server = await registerRoutes(app);

  // Use centralized error handler
  app.use(require('./middleware/errorHandler').errorHandler);

  // importantly only setup vite in development and after
  // setting up all the other routes so the catch-all route
  // doesn't interfere with the other routes
  if (app.get("env") === "development") {
    await setupVite(app, server);
  } else {
    serveStatic(app);
  }

  // Validate configuration before starting server
  validateConfig();
  
  // Use configuration values
  const { port, host } = config.server;
  server.listen({
    port,
    host,
    reusePort: true,
  }, async () => {
    log(`serving on ${host}:${port} in ${config.server.env} mode`);
    
    // Start ngrok tunnel in development mode
    if (app.get("env") === "development") {
      await startNgrok();
    }
  });
})();