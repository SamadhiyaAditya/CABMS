/**
 * Auth Routes
 * 
 * POST /auth/register  — Public — Register as customer or shopkeeper
 * POST /auth/login     — Public — Login and receive JWT
 * GET  /auth/me        — Any authenticated user — Get current profile
 */

import { Router } from 'express';
import AuthController from '../controllers/AuthController';
import { authenticate } from '../middlewares/authMiddleware';

const router = Router();

// Public routes
router.post('/register', (req, res, next) => {
  AuthController.register(req, res).catch(next);
});

router.post('/login', (req, res, next) => {
  AuthController.login(req, res).catch(next);
});

// Protected route — requires valid JWT
router.get('/me', authenticate, (req, res, next) => {
  AuthController.me(req, res).catch(next);
});

export default router;
