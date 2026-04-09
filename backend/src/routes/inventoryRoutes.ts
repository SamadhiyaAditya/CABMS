import { Router } from 'express';
import InventoryController from '../controllers/InventoryController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireShopkeeper } from '../middlewares/roleGuard';

const router = Router();

// Entire router is strictly for Shopkeepers
router.use(authenticate);
router.use(requireShopkeeper);

router.get('/', (req, res, next) => { InventoryController.getAllStock(req, res).catch(next); });
router.patch('/:menuItemId', (req, res, next) => { InventoryController.updateStock(req, res).catch(next); });

export default router;
