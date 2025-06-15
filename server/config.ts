/**
 * Application configuration
 */

// Load environment variables
import dotenv from 'dotenv';
dotenv.config();

// Configuration object with defaults
export const config = {
  // Server settings
  server: {
    port: parseInt(process.env.PORT || '5000', 10),
    host: process.env.HOST || '0.0.0.0',
    env: process.env.NODE_ENV || 'development',
  },
  
  // Database settings
  database: {
    url: process.env.DATABASE_URL,
  },
  
  // Authentication settings
  auth: {
    sessionSecret: process.env.SESSION_SECRET || 'default-secret-change-in-production',
    sessionTtl: 7 * 24 * 60 * 60 * 1000, // 1 week
    issuerUrl: process.env.ISSUER_URL || 'https://replit.com/oidc',
    replId: process.env.REPL_ID,
    replitDomains: process.env.REPLIT_DOMAINS?.split(',') || [],
  },
  
  // Demo settings
  demo: {
    enabled: process.env.ENABLE_DEMO === 'true',
    defaultAdminId: 'demo-admin',
    defaultProjectId: 1,
  },
};

// Validate required configuration
export function validateConfig() {
  const requiredVars = [
    { key: 'database.url', value: config.database.url },
    { key: 'auth.sessionSecret', value: config.auth.sessionSecret },
    { key: 'auth.replId', value: config.auth.replId },
  ];
  
  const missing = requiredVars.filter(v => !v.value);
  
  if (missing.length > 0) {
    throw new Error(
      `Missing required configuration: ${missing.map(m => m.key).join(', ')}`
    );
  }
  
  // Warn about insecure defaults in production
  if (config.server.env === 'production') {
    if (config.auth.sessionSecret === 'default-secret-change-in-production') {
      console.warn('WARNING: Using default session secret in production!');
    }
  }
  
  return config;
}