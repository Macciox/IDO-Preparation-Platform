# Deploying to Netlify

Since you're having issues with Vercel, let's try deploying to Netlify instead, which often handles single-page applications better.

## Steps to Deploy to Netlify

1. **Sign up for Netlify**
   - Go to [netlify.com](https://netlify.com) and sign up for an account

2. **Connect your GitHub repository**
   - Click "New site from Git"
   - Select GitHub and authorize Netlify
   - Choose your repository

3. **Configure build settings**
   - Build command: `npm run build`
   - Publish directory: `dist`
   - Click "Deploy site"

4. **Set environment variables**
   - Go to Site settings > Build & deploy > Environment
   - Add the following variables:
     - `DATABASE_URL`: Your Supabase connection string
     - `SESSION_SECRET`: A secure random string

5. **Wait for deployment**
   - Netlify will build and deploy your site
   - You'll get a URL like `your-site-name.netlify.app`

## What's Different in This Setup

1. Added a `netlify.toml` configuration file
2. Added proper redirects for single-page application routing
3. Simplified the build process to focus on the frontend

## Accessing Your Application

Once deployed, you can access your application at the Netlify URL. The frontend should load properly, though you'll need to set up API functionality separately.

## Alternative: Deploy Frontend Only

If you're still having issues, you can deploy just the frontend to Netlify and keep your API running locally or on another service like Render or Railway.