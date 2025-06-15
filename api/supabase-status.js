import { checkDbConnection } from './supabase.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default async function handler(req, res) {
  try {
    const dbStatus = await checkDbConnection();
    
    res.status(200).json({
      status: dbStatus.connected ? "online" : "offline",
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error checking Supabase status:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to check Supabase status",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}