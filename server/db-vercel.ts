import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

import { config } from './config';

// For Vercel serverless functions, we need to handle connection pooling differently
// This approach creates a new connection for each serverless function invocation
const client = postgres(config.database.url, { 
  max: 1,
  idle_timeout: 10,
  connect_timeout: 10
});

// Create drizzle database instance
export const db = drizzle(client, { schema });