import { z } from 'zod/v4';

/**
 * Menu Category Validators
 */
export const createCategorySchema = z.object({
  name: z.string().min(2, 'Category name must be at least 2 characters').max(50),
  description: z.string().max(255).optional(),
});

export const updateCategorySchema = createCategorySchema.partial();

/**
 * Menu Item Validators
 */
export const createItemSchema = z.object({
  categoryId: z.string().uuid('Invalid category ID'),
  name: z.string().min(2, 'Item name must be at least 2 characters').max(100),
  description: z.string().max(255).optional(),
  price: z.coerce.number().positive('Price must be greater than 0'),
  imageUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  initialStock: z.coerce.number().int().min(0).default(0), // Sets up inventory immediately
});

export const updateItemSchema = z.object({
  name: z.string().min(2).max(100).optional(),
  description: z.string().max(255).optional().nullable(),
  price: z.coerce.number().positive().optional(),
  categoryId: z.string().uuid().optional(),
  imageUrl: z.string().url().optional().nullable().or(z.literal('')),
  isAvailable: z.boolean().optional(),
});

/**
 * Inventory Validators
 */
export const updateInventorySchema = z.object({
  stockCount: z.coerce.number().int().min(0, 'Stock cannot be negative').optional(),
  lowStockThreshold: z.coerce.number().int().min(0).optional(),
});
