import { Request, Response } from 'express';
import CartService from '../services/CartService';
import { addToCartSchema, updateCartItemSchema } from '../validators/cartValidator';
import { ValidationError } from '../utils/errors';

class CartController {
  async getMyCart(req: Request, res: Response) {
    const customerId = req.user!.userId;
    const cart = await CartService.getOrCreateCart(customerId);
    res.status(200).json({ success: true, cart });
  }

  async addItem(req: Request, res: Response) {
    const customerId = req.user!.userId;
    const parsed = addToCartSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues.map((e: any) => e.message).join(', '));

    const cartItem = await CartService.addItemToCart(customerId, parsed.data.menuItemId, parsed.data.quantity);
    res.status(200).json({ success: true, message: 'Item added to cart', cartItem });
  }

  async updateItem(req: Request, res: Response) {
    const customerId = req.user!.userId;
    const parsed = updateCartItemSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues.map((e: any) => e.message).join(', '));

    await CartService.updateItemQuantity(customerId, req.params.cartItemId as string, parsed.data.quantity);
    res.status(200).json({ success: true, message: 'Cart updated' });
  }

  async removeItem(req: Request, res: Response) {
    const customerId = req.user!.userId;
    await CartService.removeItemFromCart(customerId, req.params.cartItemId as string);
    res.status(200).json({ success: true, message: 'Item removed' });
  }
}

export default new CartController();
