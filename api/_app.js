// Main API handler for Vercel serverless functions
import { checkDbConnection } from './db.js';

export default async function handler(req, res) {
  // Set CORS headers
  res.setHeader('Access-Control-Allow-Credentials', true);
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET,OPTIONS,PATCH,DELETE,POST,PUT');
  res.setHeader(
    'Access-Control-Allow-Headers',
    'X-CSRF-Token, X-Requested-With, Accept, Accept-Version, Content-Length, Content-MD5, Content-Type, Date, X-Api-Version'
  );

  // Handle OPTIONS request
  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    // Check database connection
    const dbStatus = await checkDbConnection();
    
    // Return API status with database connection info
    res.status(200).json({
      status: 'API is running',
      database: dbStatus,
      message: 'Welcome to the IDO Preparation Platform API',
      version: '1.0.0',
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('API error:', error);
    res.status(500).json({
      status: 'error',
      message: 'An error occurred in the API',
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}