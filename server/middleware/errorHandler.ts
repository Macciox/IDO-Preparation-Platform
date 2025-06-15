import { Request, Response, NextFunction } from 'express';
import { ZodError } from 'zod';
import { config } from '../config';

/**
 * Centralized error handling middleware
 */
export function errorHandler(err: any, req: Request, res: Response, next: NextFunction) {
  // Get status code from error if available, default to 500
  const status = err.status || err.statusCode || 500;
  const message = err.message || "Internal Server Error";
  
  // Log the error
  console.error(`[ERROR] ${req.method} ${req.path} - ${status} ${message}`);
  
  // Handle specific error types
  if (err instanceof ZodError) {
    return res.status(400).json({ 
      message: "Validation error", 
      errors: err.errors 
    });
  }
  
  // In development, include stack trace
  const errorResponse: any = { message };
  if (config.server.env === 'development') {
    errorResponse.stack = err.stack;
  }
  
  res.status(status).json(errorResponse);
}