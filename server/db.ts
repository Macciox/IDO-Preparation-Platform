import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import * as schema from "@shared/schema";

import { validateConfig } from './config';

// Validate configuration
validateConfig();

import { config } from './config';

// Create postgres connection
const client = postgres(config.database.url);

// Create drizzle database instance
export const db = drizzle(client, { schema });