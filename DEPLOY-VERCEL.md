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
   - Build Command: (leave empty)
   - Output Directory: ./
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

1. **Build Errors**: Simplified deployment by using static HTML instead of build process
2. **Configuration**: Updated vercel.json with simple rewrites
3. **Static Files**: Added index.html as a static landing page

### Next Steps After Deployment

Once the static version is deployed successfully:

1. Set up a proper build pipeline using a CI/CD service like GitHub Actions
2. Build the frontend separately and deploy the built files to Vercel
3. Deploy the backend API to a service like Render, Railway, or Fly.io

## Alternative Deployment Options

If Vercel continues to have issues with the build process, consider:

1. **Netlify**: Similar to Vercel but with different build processes
2. **GitHub Pages**: For static frontend only
3. **Render**: Can handle both frontend and backend
4. **Railway**: Good for full-stack applications

## Monitoring

Use Vercel's built-in monitoring to check for any deployment issues or runtime errors.