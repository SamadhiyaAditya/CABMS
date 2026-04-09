/**
 * Auth Request Validators — Zod schemas
 * 
 * Validates all auth-related request bodies before they reach business logic.
 * Rejects malformed data with 400 Bad Request and readable error messages.
 * 
 * SOLID: SRP — validation logic is separate from business logic
 */

import { z } from 'zod/v4';

export const registerSchema = z.object({
  name: z.string().min(2, 'Name must be at least 2 characters').max(100),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters').max(128),
  role: z.enum(['CUSTOMER', 'SHOPKEEPER']),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(1, 'Password is required'),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
