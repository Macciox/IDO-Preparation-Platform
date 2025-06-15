import { createClient } from '@supabase/supabase-js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default async function handler(req, res) {
  try {
    // Supabase configuration
    const supabaseUrl = process.env.SUPABASE_URL || 'https://hugfcugkzxrjnbucxcik.supabase.co';
    const supabaseKey = process.env.SERVICE_KEY || 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Imh1Z2ZjdWdrenhyam5idWN4Y2lrIiwicm9sZSI6InNlcnZpY2Vfcm9sZSIsImlhdCI6MTc0OTk5OTIyMSwiZXhwIjoyMDY1NTc1MjIxfQ.GDM6IxF-295kkZLnt95G9_qjS5UsSjRHGzanBRVwKnw';
    
    // Create Supabase client
    const supabase = createClient(supabaseUrl, supabaseKey);
    
    // Test connection with a simple health check
    const { data, error } = await supabase.auth.getSession();
    
    if (error) {
      throw error;
    }
    
    res.status(200).json({
      status: "online",
      connection: "successful",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Connection error:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to connect to Supabase",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}