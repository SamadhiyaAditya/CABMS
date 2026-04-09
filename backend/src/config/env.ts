/**
 * CAMS — Environment Configuration
 * Loads and validates all environment variables at startup using zod.
 * 
 * PATTERN: Singleton (reuse) — config loaded once and shared app-wide
 * SOLID: SRP — this file only handles environment configuration
 * SOLID: DIP — other modules import from this abstraction, not from process.env directly
 */

import dotenv from 'dotenv';
import { z } from 'zod/v4';

dotenv.config();

const envSchema = z.object({
  DATABASE_URL: z.string().min(1, 'DATABASE_URL is required'),
  JWT_SECRET: z.string().min(1, 'JWT_SECRET is required'),
  JWT_EXPIRES_IN: z.string().default('24h'),
  PORT: z.coerce.number().default(3001),
  FRONTEND_URL: z.string().default('http://localhost:3000'),
});

const parsed = envSchema.safeParse(process.env);

if (!parsed.success) {
  console.error('❌ Invalid environment variables:');
  console.error(parsed.error.flatten().fieldErrors);
  process.exit(1);
}

export const env = parsed.data;
