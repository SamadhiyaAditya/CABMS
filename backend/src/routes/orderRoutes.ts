import { Router } from 'express';
import OrderController from '../controllers/OrderController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireCustomer } from '../middlewares/roleGuard';

const router = Router();

router.use(authenticate);

// Customers logic
router.post('/checkout', requireCustomer, (req, res, next) => { OrderController.checkout(req, res).catch(next); });
router.get('/history', requireCustomer, (req, res, next) => { OrderController.getMyOrders(req, res).catch(next); });

export default router;
