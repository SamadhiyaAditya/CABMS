import { Router } from 'express';
import MenuController from '../controllers/MenuController';
import { authenticate } from '../middlewares/authMiddleware';
import { requireShopkeeper } from '../middlewares/roleGuard';

const router = Router();

// Public: Customer / Guest can view menu freely.
router.get('/', (req, res, next) => { MenuController.getFullMenu(req, res).catch(next); });
router.get('/categories', (req, res, next) => { MenuController.getCategories(req, res).catch(next); });

// Protected: Shopkeepers only map
router.use(authenticate);
router.use(requireShopkeeper);

router.post('/categories', (req, res, next) => { MenuController.createCategory(req, res).catch(next); });
router.post('/items', (req, res, next) => { MenuController.createItem(req, res).catch(next); });
router.put('/items/:id', (req, res, next) => { MenuController.updateItem(req, res).catch(next); });
router.delete('/items/:id', (req, res, next) => { MenuController.deleteItem(req, res).catch(next); });

export default router;
