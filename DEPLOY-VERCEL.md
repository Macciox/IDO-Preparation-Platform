# Deploying to Vercel

This guide provides updated instructions for deploying the IDO Preparation Platform to Vercel.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup)
2. Your code pushed to a Git repository (GitHub, GitLab, or Bitbucket)

## Deployment Steps

### 1. Import Your Project

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your Git repository
4. Configure the project settings:
   - Framework Preset: Other
   - Root Directory: ./
   - Build Command: `npx vite build`
   - Output Directory: `dist`
   - Install Command: `npm install`

### 2. Configure Environment Variables

Add these environment variables in the Vercel project settings:
- `DATABASE_URL`: Your Supabase PostgreSQL connection string
- `SESSION_SECRET`: A secure random string for session encryption
- `NODE_ENV`: Set to "production"

### 3. Deploy

Click "Deploy" and wait for the build to complete.

## Troubleshooting

### Fixed Issues

1. **Duplicate Dependencies**: Removed duplicate `passport-local` entry in package.json
2. **Vercel Configuration**: Updated vercel.json with explicit build command
3. **Build Command**: Changed from `vite build` to `npx vite build` to ensure Vite is found

### If You Still See Code Instead of the App

If you still see code instead of the application after deployment:

1. Check that the build completed successfully in Vercel logs
2. Verify that the Output Directory is set to `dist`
3. Make sure your `index.html` is being properly served

## Testing Your Deployment

After deployment, test these features:
1. Frontend loads correctly (no code showing)
2. API endpoints respond properly
3. Authentication works
4. Project data displays correctly

## Monitoring

Use Vercel's built-in monitoring to check for any deployment issues or runtime errors.