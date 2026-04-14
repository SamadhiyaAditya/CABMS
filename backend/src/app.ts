/**
 * Express Application Setup
 * 
 * Configures: CORS (RISK-05), JSON parsing, morgan logging, routes, error handler.
 * The error handler is the LAST middleware (RISK-04).
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
import helmet from 'helmet';
import compression from 'compression';
import rateLimit from 'express-rate-limit';
import { env } from './config/env';
import { errorHandler } from './middlewares/errorHandler';

// Route imports
import authRoutes from './routes/authRoutes';
import menuRoutes from './routes/menuRoutes';
import inventoryRoutes from './routes/inventoryRoutes';
import cartRoutes from './routes/cartRoutes';
import orderRoutes from './routes/orderRoutes';
import reviewRoutes from './routes/reviewRoutes';
import reportRoutes from './routes/reportRoutes';

import InventoryService from './services/InventoryService';
import { ShopkeeperConsoleAlertObserver } from './patterns/OrderObserver';

const app = express();

// Wire up the Inventory Observer!
// This automatically sends an alert anytime stock drops too low during runtime.
InventoryService.addObserver(new ShopkeeperConsoleAlertObserver());

// ─────────────────────────────────────────────
// Middleware
// ─────────────────────────────────────────────

// Security headers (Helmet)
app.use(helmet());

// CORS — Allowed origins (Refined for production safety)
app.use(cors({
  origin: true, // In production, replace with specific domain
  credentials: true,
}));

// Performance: Gzip compression
app.use(compression());

// Parse JSON request bodies
app.use(express.json());

// HTTP request logging (development)
app.use(morgan('dev'));

// Rate Limiting — Relaxed for development stability
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000, 
  max: 1000, // Increased from 100 to 1000 to avoid blocking during dashboard usage
  standardHeaders: true,
  legacyHeaders: false,
  message: 'Too many requests from this IP, please try again after 15 minutes'
});
app.use(limiter);

// ─────────────────────────────────────────────
// Routes
// ─────────────────────────────────────────────

// Health check
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Auth module
app.use('/auth', authRoutes);

// Menu & Inventory modules (Sprint 2)
app.use('/menu', menuRoutes);
app.use('/inventory', inventoryRoutes);

// Cart & Orders modules (Sprint 3)
app.use('/cart', cartRoutes);
app.use('/orders', orderRoutes);

// Reviews & Reports modules (Sprint 4)
app.use('/reviews', reviewRoutes);
app.use('/reports', reportRoutes);

// ─────────────────────────────────────────────
// Global Error Handler — MUST be last (RISK-04)
// ─────────────────────────────────────────────
app.use(errorHandler);

export default app;
