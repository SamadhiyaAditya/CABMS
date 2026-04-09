import { Router } from 'express';
import ReviewController from '../controllers/ReviewController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireCustomer } from '../middlewares/roleGuard';

const router = Router();

// Fully public fetching
router.get('/:menuItemId', (req, res, next) => { ReviewController.getReviews(req, res).catch(next); });

// Only actively logged-in Customers can actually post reviews
router.post('/:menuItemId', authenticate, requireCustomer, (req, res, next) => { ReviewController.addReview(req, res).catch(next); });

export default router;
