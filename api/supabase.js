import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

// Supabase configuration
const supabaseUrl = process.env.SUPABASE_URL || 'https://hugfcugkzxrjnbucxcik.supabase.co';

// Use the service key for server-side operations to bypass RLS
// This gives full access to the database
const supabaseServiceKey = process.env.SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1Z2ZjdWdrenhyam5idWN4Y2lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTk5OTIyMSwiZXhwIjoyMDY1NTc1MjIxfQ.GDM6IxF-295kkZLnt95G9_qjS5UsSjRHGzanBRVwKnw';

// Create Supabase client with service role key for server-side operations
export const supabase = createClient(supabaseUrl, supabaseServiceKey);

// Check database connection
export async function checkDbConnection() {
  try {
    // Test the connection with a simple query
    // Using a simpler query that doesn't use count(*)
    const { data, error } = await supabase
      .from('sessions')
      .select('sid')
      .limit(1);
    
    if (error) throw error;
    
    return { 
      connected: true,
      info: 'Connected to Supabase successfully'
    };
  } catch (error) {
    console.error('Supabase connection error:', error);
    
    // If the error is about the table not existing, try a simpler query
    if (error.message && error.message.includes('does not exist')) {
      try {
        // Try a system-level query that should always work
        const { data, error: systemError } = await supabase.rpc('get_system_info');
        
        if (!systemError) {
          return {
            connected: true,
            info: 'Connected to Supabase successfully, but sessions table does not exist yet'
          };
        }
      } catch (innerError) {
        console.error('Secondary connection check failed:', innerError);
      }
    }
    
    return { 
      connected: false, 
      error: error.message || 'Unknown error connecting to Supabase'
    };
  }
}