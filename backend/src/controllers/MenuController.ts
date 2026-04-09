import { Request, Response } from 'express';
import MenuService from '../services/MenuService';
import { createCategorySchema, createItemSchema, updateCategorySchema, updateItemSchema } from '../validators/menuValidator';
import { ValidationError } from '../utils/errors';

class MenuController {
  /**
   * GET /menu
   * Public endpoint. Fetches the entire constructed Composite tree.
   */
  async getFullMenu(req: Request, res: Response) {
    const menuTree = await MenuService.getFullMenuTree();
    res.status(200).json({ success: true, menu: menuTree });
  }

  /**
   * GET /menu/categories
   */
  async getCategories(req: Request, res: Response) {
    const categories = await MenuService.getCategories();
    res.status(200).json({ success: true, categories });
  }

  /**
   * POST /menu/categories
   * Guarded by requireShopkeeper.
   */
  async createCategory(req: Request, res: Response) {
    const parsed = createCategorySchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues.map((e: any) => e.message).join(', '));
    }
    const cat = await MenuService.createCategory(parsed.data);
    res.status(201).json({ success: true, category: cat });
  }

  /**
   * POST /menu/items
   * Guarded by requireShopkeeper.
   */
  async createItem(req: Request, res: Response) {
    const parsed = createItemSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues.map((e: any) => e.message).join(', '));
    }
    const result = await MenuService.createMenuItem(parsed.data);
    res.status(201).json({ success: true, data: result });
  }

  /**
   * PUT /menu/items/:id
   * Guarded by requireShopkeeper.
   */
  async updateItem(req: Request, res: Response) {
    const parsed = updateItemSchema.safeParse(req.body);
    if (!parsed.success) {
      throw new ValidationError(parsed.error.issues.map((e: any) => e.message).join(', '));
    }
    const result = await MenuService.updateMenuItem(req.params.id as string, parsed.data);
    res.status(200).json({ success: true, item: result });
  }

  /**
   * DELETE /menu/items/:id
   * Guarded by requireShopkeeper.
   */
  async deleteItem(req: Request, res: Response) {
    await MenuService.deleteMenuItem(req.params.id as string);
    res.status(200).json({ success: true, message: 'Item deleted' });
  }
}

export default new MenuController();
