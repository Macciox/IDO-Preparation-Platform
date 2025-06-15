import { checkDbConnection } from './db.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default async function handler(req, res) {
  try {
    // Log the database URL (with password masked)
    const dbUrl = process.env.DATABASE_URL || 'not set';
    console.log('Database URL (masked):', dbUrl.replace(/:[^:]*@/, ':***@'));
    
    const dbStatus = await checkDbConnection();
    
    res.status(200).json({
      status: dbStatus.connected ? "online" : "offline",
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking database status:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to check database status",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}