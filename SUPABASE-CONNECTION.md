# Supabase Database Connection Guide

This guide explains how to properly set up your Supabase database connection for the IDO Preparation Platform.

## Connection String Format

The correct format for your Supabase connection string is:

```
postgresql://[USER]:[PASSWORD]@[HOST]:[PORT]/[DATABASE]
```

## Special Characters in Password

If your password contains special characters like `@`, they need to be URL-encoded:

- `@` becomes `%40`
- `:` becomes `%3A`
- `/` becomes `%2F`
- etc.

## Your Specific Connection String

For your password `nvy9rbg@JRC_azp@hva`, the properly encoded connection string should be:

```
postgresql://postgres.hugfcugkzxrjnbucxcik:nvy9rbg%40JRC_azp%40hva@aws-0-eu-west-2.pooler.supabase.com:6543/postgres
```

## Setting Up in Vercel

1. Go to your Vercel project dashboard
2. Navigate to Settings > Environment Variables
3. Add or update the `DATABASE_URL` variable with the properly encoded connection string
4. Redeploy your application

## Testing the Connection

After updating the connection string:

1. Visit your application URL
2. Click on "Initialize Database" to test the connection
3. Then click on "Check Database Status" to verify it's working

## Troubleshooting

If you still have connection issues:

1. **Check Supabase Settings**:
   - Go to your Supabase project dashboard
   - Navigate to Project Settings > Database
   - Under "Connection Pooling", make sure it's enabled
   - Copy the connection string from there

2. **Check Network Access**:
   - In Supabase, go to Project Settings > Database > Network
   - Enable "Trusted IPs only" and add Vercel's IP ranges
   - Or temporarily set to "Allow all" for testing

3. **Check Vercel Logs**:
   - Go to your Vercel project dashboard
   - Click on the latest deployment
   - Go to "Functions" tab
   - Check logs for the `/api/db-status` and `/api/init-db` endpoints

## Alternative Connection Methods

If direct connection still fails, try:

1. **Supabase Connection Pooling**:
   - Use the connection pooling URL from Supabase
   - Format: `postgresql://postgres.[PROJECT_REF]:[PASSWORD]@[HOST]:6543/postgres`

2. **Supabase REST API**:
   - Consider using Supabase's REST API instead of direct database access
   - This can be more reliable for serverless environments