# IDO Preparation Platform

## Database Migration to Supabase

The database has been migrated from Neon to Supabase. The connection string is stored in the `.env` file.

## Local Development Setup

### Prerequisites
- Node.js (v16 or higher)
- npm

### Setup Instructions

1. Make sure you have the `.env` file with the Supabase connection string:
   ```
   DATABASE_URL="postgresql://postgres.hugfcugkzxrjnbucxcik:nvy9rbg@JRC_azp@hva@aws-0-eu-west-2.pooler.supabase.com:6543/postgres"
   SESSION_SECRET="your-session-secret-change-in-production"
   REPL_ID="your-repl-id"
   ```

2. Install dependencies:
   ```
   npm install
   ```

3. Push the database schema to Supabase:
   ```
   npm run db:push
   ```

4. Start the development server:
   - On Windows: Double-click `local-dev.bat` or run `npm run dev:windows`
   - On macOS/Linux: Run `npm run dev`

5. Access your application:
   - Locally: http://localhost:5000
   - Online: The ngrok URL will be displayed in the console

## Online Access with ngrok

When you start the development server, ngrok automatically creates a public URL that tunnels to your local server. This URL will be displayed in the console and can be shared with others to access your application.

## Database Connection

The application now uses `postgres-js` instead of `@neondatabase/serverless` for connecting to Supabase.