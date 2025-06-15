import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';

// Format the connection string properly for Supabase
const getConnectionString = () => {
  const dbUrl = process.env.DATABASE_URL;
  
  // If the connection string already has the correct format, return it as is
  if (dbUrl && !dbUrl.includes('@JRC_azp@')) {
    return dbUrl;
  }
  
  // Handle special characters in password by URL encoding them
  try {
    // Extract parts from the connection string
    // Expected format: postgresql://postgres.hugfcugkzxrjnbucxcik:nvy9rbg@JRC_azp@hva@aws-0-eu-west-2.pooler.supabase.com:6543/postgres
    const parts = dbUrl.split(':');
    const protocol = parts[0];
    const userPart = parts[1].substring(2); // Remove //
    
    // Find the position of the first @ to separate username from password
    const firstAtPos = parts[2].indexOf('@');
    const password = parts[2].substring(0, firstAtPos);
    
    // Find the rest of the connection string (host, port, database)
    const restOfUrl = dbUrl.substring(dbUrl.indexOf('@aws-'));
    
    // Encode the password properly
    const encodedPassword = encodeURIComponent(password);
    
    // Reconstruct the connection string
    return `${protocol}://${userPart}:${encodedPassword}${restOfUrl}`;
  } catch (error) {
    console.error('Error formatting connection string:', error);
    return dbUrl; // Return original if parsing fails
  }
};

// For Vercel serverless functions, we need to handle connection pooling differently
const client = postgres(getConnectionString(), { 
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