// Simple API handler for Vercel
export default function handler(req, res) {
  // Redirect to the frontend for non-API routes
  if (!req.url.startsWith('/api/')) {
    return res.status(200).send(`
      <html>
        <head>
          <meta http-equiv="refresh" content="0;url=/" />
        </head>
        <body>
          <p>Redirecting to the main application...</p>
        </body>
      </html>
    `);
  }

  // Handle API routes
  if (req.url === '/api/hello') {
    return res.status(200).json({ message: 'Hello from the API!' });
  }

  // Default response
  res.status(200).json({ 
    status: 'API is running',
    message: 'Welcome to the IDO Preparation Platform API'
  });
}