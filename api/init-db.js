import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

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

// For Vercel serverless functions
const connectionString = getConnectionString();
console.log('Using connection string (masked):', connectionString.replace(/:[^:]*@/, ':***@'));

const client = postgres(connectionString, { 
  max: 1,
  idle_timeout: 10,
  connect_timeout: 10
});

export default async function handler(req, res) {
  try {
    // Test database connection
    const testResult = await client`SELECT 1 as connected`;
    
    if (testResult[0].connected === 1) {
      // Database is connected
      res.status(200).json({
        status: "success",
        message: "Database connection successful",
        timestamp: new Date().toISOString()
      });
    } else {
      res.status(500).json({
        status: "error",
        message: "Database connection test failed",
        timestamp: new Date().toISOString()
      });
    }
  } catch (error) {
    console.error('Database initialization error:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to connect to database",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}