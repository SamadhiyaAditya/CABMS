import { Router } from 'express';
import OrderController from '../controllers/OrderController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireCustomer, requireShopkeeper } from '../middlewares/roleGuard';

const router = Router();

router.use(authenticate);

// Customer routes
router.post('/checkout', requireCustomer, (req, res, next) => { OrderController.checkout(req, res).catch(next); });
router.get('/history', requireCustomer, (req, res, next) => { OrderController.getMyOrders(req, res).catch(next); });

// Shopkeeper routes — view all orders and update status
router.get('/stream', requireShopkeeper, (req, res, next) => { OrderController.streamLiveOrders(req, res).catch(next); });
router.get('/all', requireShopkeeper, (req, res, next) => { OrderController.getAllOrders(req, res).catch(next); });
router.patch('/:id/status', requireShopkeeper, (req, res, next) => { OrderController.updateOrderStatus(req, res).catch(next); });

export default router;
