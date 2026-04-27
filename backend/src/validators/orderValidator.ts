/**
 * Order Validators — Zod schemas
 * 
 * Validates order status updates before they reach business logic.
 * SOLID: SRP — validation logic is separate from business logic
 */

import { z } from 'zod/v4';

export const updateOrderStatusSchema = z.object({
  status: z.enum(['PENDING', 'READY', 'PICKED_UP'], {
    error: 'Status must be one of: PENDING, READY, PICKED_UP'
  }),
});

export type UpdateOrderStatusInput = z.infer<typeof updateOrderStatusSchema>;
