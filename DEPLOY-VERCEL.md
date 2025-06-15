# Deploying to Vercel

This guide provides updated instructions for deploying the IDO Preparation Platform to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)
3. A Supabase PostgreSQL database (see [VERCEL-DB-SETUP.md](./VERCEL-DB-SETUP.md) for setup instructions)

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
- `DATABASE_URL`: Your Supabase PostgreSQL connection string
- `SESSION_SECRET`: A secure random string for session encryption
- `NODE_ENV`: Set to "production"

### 3. Deploy

Click "Deploy" and wait for the build to complete.

## Database Setup

For detailed instructions on setting up your database with Vercel, see [VERCEL-DB-SETUP.md](./VERCEL-DB-SETUP.md).

## Troubleshooting

### Fixed Issues

1. **Build Errors**: Updated build command to use `npm run vercel-build`
2. **Configuration**: Updated vercel.json with proper builds and routes
3. **Static Files**: Added index.html as a static landing page
4. **Database Connection**: Added specialized database connection handling for serverless functions
5. **API Routes**: Added proper API routes for Vercel serverless functions

### Checking Database Connection

After deployment, you can check if your database is connected by visiting:
```
https://your-vercel-domain.vercel.app/api/db-status
```

If the database is properly connected, you should see a response like:
```json
{
  "status": "online",
  "database": {
    "connected": true
  },
  "timestamp": "2023-06-01T12:34:56.789Z"
}
```

### Handling Warnings

Some warnings you might see during deployment are harmless:

1. **Deprecated packages warnings**: Messages about `@esbuild-kit/esm-loader` and `@esbuild-kit/core-utils` being merged into tsx are informational only and don't affect functionality.

2. **Duplicate key warnings**: These have been fixed by removing duplicate entries in package.json.

## Monitoring

Use Vercel's built-in monitoring to check for any deployment issues or runtime errors.