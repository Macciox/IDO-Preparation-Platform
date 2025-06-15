import { z } from "zod";

// Common validation schemas
export const statusSchema = z.enum(["confirmed", "not_confirmed", "might_change"]);

// URL validation with more comprehensive regex
export const urlSchema = z.string().regex(
  /^(https?:\/\/)?(www\.)?([a-z0-9-]+\.)+[a-z]{2,6}(\/[^\/\s]*)*(\/)?$/i,
  "Invalid URL format"
).nullable().optional();

// Email validation
export const emailSchema = z.string().email("Invalid email format");

// Date validation (ISO format)
export const dateSchema = z.string()
  .refine(val => !val || !isNaN(Date.parse(val)), {
    message: "Invalid date format. Use ISO format (YYYY-MM-DD)"
  })
  .nullable()
  .optional();

// Numeric string validation
export const numericStringSchema = z.string()
  .refine(val => !val || !isNaN(Number(val)), {
    message: "Must be a valid number"
  })
  .nullable()
  .optional();

// Contract address validation (Ethereum-style)
export const contractAddressSchema = z.string()
  .regex(/^0x[a-fA-F0-9]{40}$/, "Invalid contract address format")
  .nullable()
  .optional();

// Token ticker validation
export const tokenTickerSchema = z.string()
  .regex(/^[A-Z0-9]{1,10}$/, "Token ticker must be 1-10 uppercase letters or numbers")
  .nullable()
  .optional();