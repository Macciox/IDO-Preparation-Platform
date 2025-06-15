import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// For Vercel serverless functions, we need to handle connection pooling differently
const client = postgres(process.env.DATABASE_URL, { 
  max: 1,
  idle_timeout: 10,
  connect_timeout: 10
});

// Create drizzle database instance
export const db = drizzle(client);

// Health check function to test database connection
export async function checkDbConnection() {
  try {
    // Simple query to test connection
    const result = await client`SELECT 1 as connected`;
    return { connected: result[0].connected === 1 };
  } catch (error) {
    console.error('Database connection error:', error);
    return { connected: false, error: error.message };
  }
}