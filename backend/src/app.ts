/**
 * Express Application Setup
 * 
 * Configures: CORS (RISK-05), JSON parsing, morgan logging, routes, error handler.
 * The error handler is the LAST middleware (RISK-04).
 */

import express from 'express';
import cors from 'cors';
import morgan from 'morgan';
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

// CORS — Open configuration for development (Fixes Network Errors)
app.use(cors({
  origin: true,
  credentials: true,
}));

// Parse JSON request bodies
app.use(express.json());

// HTTP request logging (development)
app.use(morgan('dev'));

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
