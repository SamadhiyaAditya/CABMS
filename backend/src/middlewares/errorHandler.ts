/**
 * Global Error Handler Middleware (RISK-04 fix)
 * 
 * Must be the LAST app.use() call in Express.
 * Catches all errors thrown in route handlers and middleware.
 * Returns clean JSON error responses — never exposes stack traces.
 * 
 * OOP: Polymorphism — uses instanceof to handle different error subclasses
 * SOLID: SRP — only handles error formatting and response
 */

import { Request, Response, NextFunction } from 'express';
import { AppError } from '../utils/errors';
import { Prisma } from '@prisma/client';

export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // Custom AppError subclasses (ValidationError, AuthError, etc.)
  if (err instanceof AppError) {
    res.status(err.statusCode).json(err.toJSON());
    return;
  }

  // Prisma known errors — clean mapping to HTTP status codes
  if (err instanceof Prisma.PrismaClientKnownRequestError) {
    switch (err.code) {
      case 'P2002': // Unique constraint violation
        res.status(409).json({ error: 'A record with this value already exists' });
        return;
      case 'P2025': // Record not found
        res.status(404).json({ error: 'Record not found' });
        return;
      default:
        res.status(400).json({ error: 'Database operation failed' });
        return;
    }
  }

  // Prisma validation errors
  if (err instanceof Prisma.PrismaClientValidationError) {
    res.status(400).json({ error: 'Invalid data provided' });
    return;
  }

  // Unknown errors — log but don't expose to client
  console.error('❌ Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
};
