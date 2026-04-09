/**
 * AuthController — Thin route handler layer
 * 
 * SOLID: SRP — only handles HTTP request/response. Business logic is in AuthService.
 * Delegates all work to AuthService and returns clean JSON responses.
 */

import { Request, Response } from 'express';
import AuthService from '../services/AuthService';
import { registerSchema, loginSchema } from '../validators/authValidator';
import { ValidationError } from '../utils/errors';

class AuthController {
  /**
   * POST /auth/register
   * Register a new customer or shopkeeper.
   */
  async register(req: Request, res: Response): Promise<void> {
    // Validate request body with zod
    const parsed = registerSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((i) => i.message).join(', ')
      );
    }

    const { user, token } = await AuthService.register(parsed.data);

    res.status(201).json({
      message: 'Registration successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.getPermissions(),
        createdAt: user.createdAt,
      },
      token,
    });
  }

  /**
   * POST /auth/login
   * Login and receive JWT.
   */
  async login(req: Request, res: Response): Promise<void> {
    const parsed = loginSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(
        parsed.error.issues.map((i) => i.message).join(', ')
      );
    }

    const { user, token } = await AuthService.login(parsed.data);

    res.status(200).json({
      message: 'Login successful',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.getPermissions(),
      },
      token,
    });
  }

  /**
   * GET /auth/me
   * Get current user profile (requires JWT).
   */
  async me(req: Request, res: Response): Promise<void> {
    const userId = req.user!.userId;
    const user = await AuthService.getProfile(userId);

    res.status(200).json({
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role,
        permissions: user.getPermissions(),
        createdAt: user.createdAt,
      },
    });
  }
}

export default new AuthController();
