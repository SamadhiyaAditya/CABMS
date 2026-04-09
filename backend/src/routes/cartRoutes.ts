import { Router } from 'express';
import CartController from '../controllers/CartController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireCustomer } from '../middlewares/roleGuard';

const router = Router();

// Fully guarded by Customer role. Shopkeepers don't have carts!
router.use(authenticate);
router.use(requireCustomer);

router.get('/', (req, res, next) => { CartController.getMyCart(req, res).catch(next); });
router.post('/items', (req, res, next) => { CartController.addItem(req, res).catch(next); });
router.patch('/items/:cartItemId', (req, res, next) => { CartController.updateItem(req, res).catch(next); });
router.delete('/items/:cartItemId', (req, res, next) => { CartController.removeItem(req, res).catch(next); });

export default router;
