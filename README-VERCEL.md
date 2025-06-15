# Deploying to Vercel

This guide explains how to deploy the IDO Preparation Platform to Vercel.

## Prerequisites

1. A Vercel account (sign up at https://vercel.com)
2. The Vercel CLI installed (optional, for local testing)
   ```
   npm install -g vercel
   ```

## Deployment Steps

### 1. Set up Environment Variables

In your Vercel project settings, add the following environment variables:

- `DATABASE_URL`: Your Supabase PostgreSQL connection string
- `SESSION_SECRET`: A secure random string for session encryption
- `NODE_ENV`: Set to "production"

### 2. Deploy to Vercel

#### Option 1: Using the Vercel Dashboard

1. Import your GitHub repository in the Vercel dashboard
2. Configure the project settings:
   - Build Command: `npm run vercel-build`
   - Output Directory: `dist`
   - Install Command: `npm install`

#### Option 2: Using the Vercel CLI

1. Login to Vercel:
   ```
   vercel login
   ```

2. Deploy the project:
   ```
   vercel
   ```

3. Follow the prompts to configure your project

### 3. Verify Deployment

After deployment, Vercel will provide you with a URL to access your application. Visit this URL to ensure everything is working correctly.

## Project Structure for Vercel

- `vercel.json`: Configuration file for Vercel deployment
- `server/vercel.ts`: Entry point for the API in Vercel's serverless environment
- The frontend is built and served from the `dist` directory

## Troubleshooting

If you encounter issues with the deployment:

1. Check the Vercel deployment logs for errors
2. Ensure all environment variables are correctly set
3. Verify that your Supabase database is accessible from Vercel's servers