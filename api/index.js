// Simple API handler for Vercel
export default function handler(req, res) {
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

  // Handle API routes
  if (req.url === '/api/hello') {
    return res.status(200).json({ message: 'Hello from the API!' });
  }

  // Default response
  res.status(200).json({ 
    status: 'API is running',
    message: 'Welcome to the IDO Preparation Platform API',
    version: '1.0.0',
    timestamp: new Date().toISOString()
  });
}