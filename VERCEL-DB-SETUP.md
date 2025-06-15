# Setting Up Database on Vercel

This guide provides step-by-step instructions for setting up your Supabase PostgreSQL database with Vercel for the IDO Preparation Platform.

## 1. Create a Supabase PostgreSQL Database

If you haven't already created a Supabase database:

1. Go to [Supabase](https://supabase.com/) and sign up or log in
2. Create a new project
3. Choose a name for your project and set a secure database password
4. Select a region closest to your users
5. Wait for your database to be created (this may take a few minutes)

## 2. Get Your Database Connection String

1. In your Supabase project dashboard, go to **Project Settings** (gear icon)
2. Select **Database** from the sidebar
3. Scroll down to **Connection String**
4. Select **URI** format
5. Copy the connection string (it should look like `postgresql://postgres:[YOUR-PASSWORD]@db.[YOUR-PROJECT-ID].supabase.co:5432/postgres`)
6. Replace `[YOUR-PASSWORD]` with your database password

## 3. Set Up Environment Variables on Vercel

1. Go to your [Vercel Dashboard](https://vercel.com/dashboard)
2. Select your IDO Preparation Platform project
3. Go to **Settings** > **Environment Variables**
4. Add the following environment variables:

   | Name | Value | Environments |
   |------|-------|-------------|
   | `DATABASE_URL` | Your Supabase connection string | Production, Preview, Development |
   | `SESSION_SECRET` | A secure random string (e.g., generate with `openssl rand -base64 32`) | Production, Preview, Development |
   | `NODE_ENV` | `production` | Production |

5. Click **Save** to apply the environment variables

## 4. Initialize Your Database Schema

You have two options to initialize your database schema:

### Option 1: Using Drizzle Kit (Recommended)

1. Install Drizzle Kit globally:
   ```
   npm install -g drizzle-kit
   ```

2. Create a `.env` file locally with your Supabase connection string:
   ```
   DATABASE_URL=your_supabase_connection_string
   ```

3. Run the Drizzle push command:
   ```
   npx drizzle-kit push
   ```

### Option 2: Manual SQL Execution

1. In your Supabase dashboard, go to the **SQL Editor**
2. Create a new query
3. Copy and paste the SQL schema from the schema creation file
4. Run the query to create all tables

## 5. Redeploy Your Application

1. After setting up the database and environment variables, trigger a new deployment:
   ```
   git commit -m "Update configuration for Vercel deployment" --allow-empty
   git push
   ```

2. Vercel will automatically deploy your application with the new environment variables

## 6. Verify Database Connection

1. After deployment, visit your application URL
2. Navigate to `/api/db-status` to check if the database connection is working
3. You should see a JSON response with `"status": "online"` and `"database": {"connected": true}`

## Troubleshooting

If you encounter database connection issues:

1. **Check Connection String**: Ensure your DATABASE_URL is correctly formatted and includes the proper credentials
2. **IP Allow List**: In Supabase, go to **Project Settings** > **Database** > **Network** and ensure that Vercel's IP addresses are allowed
3. **Connection Pooling**: For production, consider enabling connection pooling in Supabase
4. **Logs**: Check Vercel deployment logs for any database connection errors

## Next Steps

Once your database is successfully connected:

1. Create an admin user in the database
2. Set up initial project data if needed
3. Configure any additional settings specific to your application

For any persistent issues, contact Vercel support or check the Supabase documentation for more information on database connectivity.