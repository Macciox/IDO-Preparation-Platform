import { Pool, neonConfig } from '@neondatabase/serverless';
import { drizzle } from 'drizzle-orm/neon-serverless';
import ws from "ws";
import * as schema from "@shared/schema";

neonConfig.webSocketConstructor = ws;

import { validateConfig } from './config';

// Validate configuration
validateConfig();

import { config } from './config';

export const pool = new Pool({ connectionString: config.database.url });
export const db = drizzle({ client: pool, schema });