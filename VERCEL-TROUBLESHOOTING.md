# Vercel Deployment Troubleshooting

This guide provides solutions for common issues when deploying the IDO Preparation Platform to Vercel.

## Database Connection Issues

### Problem: Database Not Connecting

If you see the static landing page with the message "The application is currently being deployed" and the database connection check fails:

1. **Check Environment Variables**:
   - Verify that `DATABASE_URL` is correctly set in Vercel's environment variables
   - Make sure the connection string format is correct: `postgresql://username:password@hostname:port/database`
   - Check for special characters in the password that might need URL encoding

2. **Database Access**:
   - Ensure your Supabase database allows connections from Vercel's IP addresses
   - In Supabase dashboard, go to **Project Settings** > **Database** > **Connection Pooling** and enable it
   - Consider using Supabase's connection pooling URL instead of direct connection

3. **Test Database Connection**:
   - Visit `/api/db-status` to see detailed error messages about database connection
   - Visit `/api/init-db` to attempt initializing the database connection

### Problem: "Warning: Due to `builds` existing in your configuration file..."

This warning is normal and can be safely ignored. It simply means that your `vercel.json` file is overriding the project settings in the Vercel dashboard.

## Static Site Issues

### Problem: Only Seeing Static Landing Page

If you're only seeing the static landing page without the actual application:

1. **Check API Status**:
   - Click the "Check API Status" button to verify the API is running
   - If the API is running but the app isn't loading, there might be an issue with the client-side code

2. **Build Process**:
   - Check Vercel deployment logs for any build errors
   - Ensure the build command `npm run vercel-build` is correctly set
   - Verify that the output directory is correctly configured

3. **Client-Side Routing**:
   - Make sure the routes in `vercel.json` are correctly configured
   - Check that the client-side routing is compatible with Vercel's routing

## Next Steps If Issues Persist

1. **Simplified Deployment**:
   - Consider deploying just the API to Vercel and the frontend to a separate service like Netlify
   - Split your repository into separate backend and frontend repositories

2. **Alternative Database**:
   - If Supabase connection issues persist, consider using Vercel's PostgreSQL integration
   - Go to Vercel dashboard > Storage > Create new PostgreSQL database

3. **Contact Support**:
   - If issues persist, contact Vercel support with specific error messages
   - Include deployment logs and configuration details

## Quick Fixes

### Reset Database Connection

```
1. Visit: https://your-vercel-domain.vercel.app/api/init-db
2. Check the response for connection status
3. If successful, refresh the main page
```

### Force Redeploy

```
1. Go to Vercel dashboard
2. Select your project
3. Go to Deployments tab
4. Find the latest deployment
5. Click the three dots menu
6. Select "Redeploy"
```

### Update Environment Variables

```
1. Go to Vercel dashboard
2. Select your project
3. Go to Settings > Environment Variables
4. Update DATABASE_URL with the correct connection string
5. Click "Save" and redeploy
```