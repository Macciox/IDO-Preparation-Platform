# Setting Up Supabase for IDO Preparation Platform

This guide explains how to set up Supabase for your IDO Preparation Platform on Vercel.

## Why Use Supabase Client Instead of Direct PostgreSQL Connection

When deploying to serverless environments like Vercel, direct PostgreSQL connections can be problematic because:

1. Serverless functions have short lifetimes and can't maintain persistent connections
2. Connection pooling becomes challenging
3. Special characters in connection strings can cause parsing issues

The Supabase client is specifically designed to work well with serverless environments and provides a more reliable connection method.

## Setup Steps

### 1. Install Supabase Client

```bash
npm install @supabase/supabase-js
```

### 2. Configure Environment Variables

Add these environment variables to your Vercel project:

```
SUPABASE_URL=https://hugfcugkzxrjnbucxcik.supabase.co
SUPABASE_KEY=your_service_role_key
```

For local development, add these to your `.env` file.

### 3. Create Supabase Client

Create a file called `api/supabase.js`:

```javascript
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_KEY;

export const supabase = createClient(supabaseUrl, supabaseKey);
```

### 4. Use Supabase Client in Your API

Example usage:

```javascript
import { supabase } from './supabase.js';

// Query data
const { data, error } = await supabase
  .from('your_table')
  .select('*');

// Insert data
const { data, error } = await supabase
  .from('your_table')
  .insert([{ column: 'value' }]);
```

## Security Considerations

1. **API Keys**: The service role key has full access to your database. Keep it secure and never expose it in client-side code.

2. **Row Level Security**: Enable Row Level Security (RLS) in Supabase for tables that need to be accessed from client-side code.

3. **Environment Variables**: Always store your Supabase keys as environment variables, never hardcode them.

## Testing the Connection

After setting up Supabase:

1. Deploy your application to Vercel
2. Visit `/api/supabase-status` to check if the connection is working
3. You should see a response with `"status": "online"` and `"database": {"connected": true}`

## Troubleshooting

If you encounter connection issues:

1. **Check API Keys**: Verify that your Supabase API key is correct and has the necessary permissions

2. **Check Environment Variables**: Make sure SUPABASE_URL and SUPABASE_KEY are correctly set in Vercel

3. **Check Supabase Status**: Visit your Supabase dashboard to ensure the service is running

4. **Check Network Access**: If you've restricted access to your Supabase project, make sure Vercel's IP ranges are allowed

## Migrating from Direct PostgreSQL Connection

If you're migrating from a direct PostgreSQL connection:

1. Update your database access code to use the Supabase client
2. Use Supabase's SQL interface for schema migrations
3. Consider using Supabase's authentication system instead of custom authentication

## Additional Resources

- [Supabase Documentation](https://supabase.io/docs)
- [Supabase JavaScript Client](https://supabase.io/docs/reference/javascript/introduction)
- [Vercel Environment Variables](https://vercel.com/docs/environment-variables)