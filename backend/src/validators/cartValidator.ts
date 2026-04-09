import { z } from 'zod/v4';

export const addToCartSchema = z.object({
  menuItemId: z.string().uuid('Invalid menu item ID'),
  quantity: z.number().int().positive('Quantity must be greater than 0').max(20, 'Cannot order more than 20 at a time'),
});

export const updateCartItemSchema = z.object({
  quantity: z.number().int().min(0, 'Quantity cannot be negative').max(20),
});
