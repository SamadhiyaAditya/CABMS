/**
 * Auth Middleware — JWT Validation
 * 
 * Validates JWT token from Authorization header.
 * Extracts userId and role, attaches to req.user.
 * 
 * SOLID: SRP — only handles token validation, nothing else
 */

import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { env } from '../config/env';
import { AuthError } from '../utils/errors';

export interface JwtPayload {
  userId: string;
  role: 'CUSTOMER' | 'SHOPKEEPER';
}

// Extend Express Request to include user
declare global {
  namespace Express {
    interface Request {
      user?: JwtPayload;
    }
  }
}

/**
 * Middleware: authenticate
 * Validates JWT token and attaches user payload to request.
 * Returns 401 if token is missing, invalid, or expired.
 */
export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    throw new AuthError('No token provided');
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(token, env.JWT_SECRET) as JwtPayload;
    req.user = decoded;
    next();
  } catch {
    throw new AuthError('Invalid or expired token');
  }
};
