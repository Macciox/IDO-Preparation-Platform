import { checkDbConnection } from './db.js';

export default async function handler(req, res) {
  try {
    const dbStatus = await checkDbConnection();
    
    res.status(200).json({
      status: dbStatus.connected ? "online" : "offline",
      database: dbStatus,
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    res.status(500).json({
      status: "error",
      message: "Failed to check database status",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}