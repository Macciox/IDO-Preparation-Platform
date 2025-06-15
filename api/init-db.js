import { drizzle } from 'drizzle-orm/postgres-js';
import postgres from 'postgres';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// For Vercel serverless functions
const client = postgres(process.env.DATABASE_URL, { 
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