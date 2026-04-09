import { Router } from 'express';
import ReportController from '../controllers/ReportController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireShopkeeper } from '../middlewares/roleGuard';

const router = Router();

// Completely locked from the public. Analytics are restricted to admin access.
router.use(authenticate);
router.use(requireShopkeeper);

// GET /reports?type=sales
router.get('/', (req, res, next) => { ReportController.getReport(req, res).catch(next); });

export default router;
