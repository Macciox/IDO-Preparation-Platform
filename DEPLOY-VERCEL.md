# Deploying to Vercel

This guide provides updated instructions for deploying the IDO Preparation Platform to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. A Supabase PostgreSQL database (see [SUPABASE-SETUP.md](./SUPABASE-SETUP.md) for setup instructions)

## Deployment Steps

### 1. Import Your Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your Git repository
4. Configure the project settings:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: `npm run vercel-build`
   - Output Directory: dist
   - Install Command: `npm install`

### 2. Configure Environment Variables

Add these environment variables in the Vercel project settings:
- `SUPABASE_URL`: Your Supabase project URL (https://hugfcugkzxrjnbucxcik.supabase.co)
- `SERVICE_KEY`: Your Supabase service role key (for server-side operations)
- `SUPABASE_KEY`: Your Supabase anon/public key (for client-side operations)
- `SESSION_SECRET`: A secure random string for session encryption
- `NODE_ENV`: Set to "production"

### 3. Deploy

Click "Deploy" and wait for the build to complete.

### 4. Initialize Database

After deployment:
1. Visit your deployed application
2. Click "Check Supabase Status" to verify the connection
3. Click "Initialize Database Tables" to create the required database tables

## Database Setup

For detailed instructions on setting up your database with Supabase, see [SUPABASE-SETUP.md](./SUPABASE-SETUP.md).

## Troubleshooting

### Fixed Issues

1. **Build Errors**: Updated build command to use `npm run vercel-build`
2. **Configuration**: Updated vercel.json with proper builds and routes
3. **Static Files**: Added index.html as a static landing page
4. **Database Connection**: Switched to Supabase client for better serverless compatibility
5. **API Routes**: Added proper API routes for Vercel serverless functions

### Checking Database Connection

After deployment, you can check if your database is connected by visiting your application and clicking "Check Supabase Status".

If the database is properly connected, you should see a response like:
```json
{
  "status": "online",
  "database": {
    "connected": true,
    "info": "Connected to Supabase successfully"
  },
  "timestamp": "2023-06-01T12:34:56.789Z"
}
```

### Common Issues

1. **Connection Errors**: If you see connection errors, verify your Supabase URL and API keys in the environment variables.

2. **Missing Tables**: If your application can't find database tables, use the "Initialize Database Tables" button to create them.

3. **"Warning: Due to `builds` existing in your configuration file..."**: This warning is normal and can be safely ignored.

## Monitoring

Use Vercel's built-in monitoring to check for any deployment issues or runtime errors.