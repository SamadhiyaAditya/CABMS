import { Router } from 'express';
import OrderController from '../controllers/OrderController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireCustomer, requireShopkeeper } from '../middlewares/roleGuard';

const router = Router();

router.use(authenticate);

// Customer routes
router.post('/checkout', requireCustomer, (req, res, next) => { OrderController.checkout(req, res).catch(next); });
router.get('/history', requireCustomer, (req, res, next) => { OrderController.getMyOrders(req, res).catch(next); });

// Spec-compliant aliases (§9 API Reference)
router.post('/', requireCustomer, (req, res, next) => { OrderController.checkout(req, res).catch(next); });
router.get('/my', requireCustomer, (req, res, next) => { OrderController.getMyOrders(req, res).catch(next); });

// Shopkeeper routes — view all orders and update status
router.get('/stream', requireShopkeeper, (req, res, next) => { OrderController.streamLiveOrders(req, res).catch(next); });
router.get('/all', requireShopkeeper, (req, res, next) => { OrderController.getAllOrders(req, res).catch(next); });

// Spec-compliant alias: GET /orders (shopkeeper sees all)
router.get('/', requireShopkeeper, (req, res, next) => { OrderController.getAllOrders(req, res).catch(next); });

// Shared: View single order (customer sees own, shopkeeper sees any)
router.get('/:id', (req, res, next) => { OrderController.getOrderById(req, res).catch(next); });

router.patch('/:id/status', requireShopkeeper, (req, res, next) => { OrderController.updateOrderStatus(req, res).catch(next); });

export default router;

