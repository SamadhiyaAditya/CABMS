import { Router } from 'express';
import InventoryController from '../controllers/InventoryController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireShopkeeper } from '../middlewares/roleGuard';

const router = Router();

// Guard endpoints that require shopkeeper access
router.get('/', authenticate, requireShopkeeper, (req, res, next) => { InventoryController.getAllStock(req, res).catch(next); });
router.patch('/:menuItemId', authenticate, requireShopkeeper, (req, res, next) => { InventoryController.updateStock(req, res).catch(next); });

// Public SSE stream for live inventory updates
router.get('/stream', (req, res, next) => { InventoryController.streamLiveInventory(req, res).catch(next); });

export default router;
