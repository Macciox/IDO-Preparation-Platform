# Deploying the IDO Preparation Platform to Vercel

This guide will walk you through deploying the IDO Preparation Platform to Vercel, allowing you to access it online without running it locally.

## Prerequisites

1. A [Vercel account](https://vercel.com/signup) (free tier is sufficient)
2. A [GitHub account](https://github.com/signup) to push your code
3. Git installed on your computer

## Step 1: Push Your Code to GitHub

1. Create a new GitHub repository
2. Initialize Git in your project folder (if not already done):
   ```
   git init
   ```
3. Add your files:
   ```
   git add .
   ```
4. Commit your changes:
   ```
   git commit -m "Initial commit for Vercel deployment"
   ```
5. Add your GitHub repository as a remote:
   ```
   git remote add origin https://github.com/YOUR_USERNAME/YOUR_REPO_NAME.git
   ```
6. Push your code:
   ```
   git push -u origin main
   ```

## Step 2: Deploy to Vercel

1. Go to [Vercel Dashboard](https://vercel.com/dashboard)
2. Click "Add New" > "Project"
3. Import your GitHub repository
4. Configure the project:
   - Framework Preset: Other
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `npm install`
5. Add Environment Variables:
   - `DATABASE_URL`: Your Supabase PostgreSQL connection string
   - `SESSION_SECRET`: A secure random string for session encryption
   - `NODE_ENV`: Set to "production"
6. Click "Deploy"

## Step 3: Access Your Application

After deployment completes (usually within a few minutes), Vercel will provide you with a URL to access your application. This URL will look something like:

```
https://your-project-name.vercel.app
```

You can now access your IDO Preparation Platform online using this URL.

## Step 4: Login to Your Application

1. Navigate to your Vercel URL
2. You'll be redirected to the login page
3. Use the default credentials:
   - Email: admin@example.com
   - Password: admin

## Updating Your Deployment

Whenever you make changes to your code:

1. Commit your changes:
   ```
   git add .
   git commit -m "Your update message"
   ```
2. Push to GitHub:
   ```
   git push
   ```

Vercel will automatically detect the changes and redeploy your application.

## Troubleshooting

If you encounter issues with your deployment:

1. Check the Vercel deployment logs for errors
2. Ensure all environment variables are correctly set
3. Verify that your Supabase database is accessible from Vercel's servers
4. Make sure your database schema is properly migrated using `npm run db:push` before deploying