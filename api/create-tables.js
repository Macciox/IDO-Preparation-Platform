import { supabase } from './supabase.js';
import dotenv from 'dotenv';

// Load environment variables
dotenv.config();

export default async function handler(req, res) {
  try {
    // Create sessions table if it doesn't exist
    const { error: sessionsError } = await supabase.rpc('create_sessions_table_if_not_exists');
    
    if (sessionsError) {
      // If the RPC doesn't exist, create the table directly
      const { error: createSessionsError } = await supabase.query(`
        CREATE TABLE IF NOT EXISTS sessions (
          sid VARCHAR PRIMARY KEY,
          sess JSONB NOT NULL,
          expire TIMESTAMP NOT NULL
        );
        CREATE INDEX IF NOT EXISTS IDX_session_expire ON sessions (expire);
      `);
      
      if (createSessionsError) throw createSessionsError;
    }
    
    // Create users table if it doesn't exist
    const { error: usersError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR PRIMARY KEY NOT NULL,
        email VARCHAR UNIQUE,
        first_name VARCHAR,
        last_name VARCHAR,
        profile_image_url VARCHAR,
        role VARCHAR NOT NULL DEFAULT 'project',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);
    
    if (usersError) throw usersError;
    
    // Create projects table if it doesn't exist
    const { error: projectsError } = await supabase.query(`
      CREATE TABLE IF NOT EXISTS projects (
        id SERIAL PRIMARY KEY,
        name VARCHAR NOT NULL,
        email VARCHAR NOT NULL,
        user_id VARCHAR NOT NULL REFERENCES users(id),
        slug VARCHAR UNIQUE NOT NULL,
        access_token VARCHAR UNIQUE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      CREATE INDEX IF NOT EXISTS idx_projects_user_id ON projects (user_id);
    `);
    
    if (projectsError) throw projectsError;
    
    // Return success response
    res.status(200).json({
      status: "success",
      message: "Database tables created successfully",
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