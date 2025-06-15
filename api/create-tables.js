import { supabase } from './supabase.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default async function handler(req, res) {
  try {
    // Create sessions table if it doesn't exist
    const { error: sessionsError } = await supabase.rpc('exec_sql', {
      sql_string: `
        CREATE TABLE IF NOT EXISTS sessions (
          sid VARCHAR PRIMARY KEY,
          sess JSONB NOT NULL,
          expire TIMESTAMP NOT NULL
        );
        CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);
      `
    });
    
    if (sessionsError) {
      console.error('Error creating sessions table:', sessionsError);
      
      // Try direct SQL execution
      const { error: directSqlError } = await supabase.from('_exec_sql').select('*').eq('query', `
        CREATE TABLE IF NOT EXISTS sessions (
          sid VARCHAR PRIMARY KEY,
          sess JSONB NOT NULL,
          expire TIMESTAMP NOT NULL
        );
      `);
      
      if (directSqlError) {
        console.error('Direct SQL execution failed:', directSqlError);
      }
    }
    
    // Return success response
    res.status(200).json({
      status: "success",
      message: "Database initialization attempted",
      note: "Check Supabase dashboard to verify table creation",
      timestamp: new Date().toISOString()
    });
  } catch (error) {
    console.error('Error creating tables:', error);
    res.status(500).json({
      status: "error",
      message: "Failed to create database tables",
      error: error.message,
      timestamp: new Date().toISOString()
    });
  }
}