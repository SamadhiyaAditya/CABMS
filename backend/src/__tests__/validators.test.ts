/**
 * Unit Tests — Zod Validators
 * 
 * Tests input validation schemas to ensure bad data is rejected
 * with proper error messages. No database needed.
 */

import { registerSchema, loginSchema } from '../validators/authValidator';
import { addToCartSchema, updateCartItemSchema } from '../validators/cartValidator';
import { reviewSchema } from '../validators/reviewValidator';
import { updateOrderStatusSchema } from '../validators/orderValidator';
import { updateInventorySchema, createItemSchema } from '../validators/menuValidator';

// ─── Auth Validators ───────────────────────────────────────────

describe('Auth Validators', () => {
  it('registerSchema accepts valid input', () => {
    const result = registerSchema.safeParse({
      name: 'Aditya',
      email: 'test@example.com',
      password: 'password123',
      role: 'CUSTOMER',
    });
    expect(result.success).toBe(true);
  });

  it('registerSchema rejects short password', () => {
    const result = registerSchema.safeParse({
      name: 'Aditya',
      email: 'test@example.com',
      password: '123',
      role: 'CUSTOMER',
    });
    expect(result.success).toBe(false);
  });

  it('registerSchema rejects invalid email', () => {
    const result = registerSchema.safeParse({
      name: 'Aditya',
      email: 'not-an-email',
      password: 'password123',
      role: 'CUSTOMER',
    });
    expect(result.success).toBe(false);
  });

  it('registerSchema rejects invalid role', () => {
    const result = registerSchema.safeParse({
      name: 'Aditya',
      email: 'test@example.com',
      password: 'password123',
      role: 'ADMIN',
    });
    expect(result.success).toBe(false);
  });

  it('loginSchema accepts valid input', () => {
    const result = loginSchema.safeParse({
      email: 'test@example.com',
      password: 'password123',
    });
    expect(result.success).toBe(true);
  });
});

// ─── Cart Validators ───────────────────────────────────────────

describe('Cart Validators', () => {
  it('addToCartSchema accepts valid input', () => {
    const result = addToCartSchema.safeParse({
      menuItemId: '550e8400-e29b-41d4-a716-446655440000',
      quantity: 2,
    });
    expect(result.success).toBe(true);
  });

  it('addToCartSchema rejects quantity > 20', () => {
    const result = addToCartSchema.safeParse({
      menuItemId: '550e8400-e29b-41d4-a716-446655440000',
      quantity: 25,
    });
    expect(result.success).toBe(false);
  });

  it('addToCartSchema rejects non-UUID menuItemId', () => {
    const result = addToCartSchema.safeParse({
      menuItemId: 'not-a-uuid',
      quantity: 1,
    });
    expect(result.success).toBe(false);
  });

  it('updateCartItemSchema rejects negative quantity', () => {
    const result = updateCartItemSchema.safeParse({ quantity: -1 });
    expect(result.success).toBe(false);
  });
});

// ─── Review Validators ─────────────────────────────────────────

describe('Review Validators', () => {
  it('reviewSchema accepts valid 1-5 rating', () => {
    expect(reviewSchema.safeParse({ rating: 1 }).success).toBe(true);
    expect(reviewSchema.safeParse({ rating: 5 }).success).toBe(true);
    expect(reviewSchema.safeParse({ rating: 3, comment: 'Nice!' }).success).toBe(true);
  });

  it('reviewSchema rejects rating outside 1-5', () => {
    expect(reviewSchema.safeParse({ rating: 0 }).success).toBe(false);
    expect(reviewSchema.safeParse({ rating: 6 }).success).toBe(false);
  });

  it('reviewSchema rejects comment > 500 chars', () => {
    const result = reviewSchema.safeParse({
      rating: 5,
      comment: 'x'.repeat(501),
    });
    expect(result.success).toBe(false);
  });
});

// ─── Order Status Validator ────────────────────────────────────

describe('Order Status Validator', () => {
  it('accepts valid statuses', () => {
    expect(updateOrderStatusSchema.safeParse({ status: 'PENDING' }).success).toBe(true);
    expect(updateOrderStatusSchema.safeParse({ status: 'READY' }).success).toBe(true);
    expect(updateOrderStatusSchema.safeParse({ status: 'PICKED_UP' }).success).toBe(true);
  });

  it('rejects invalid status', () => {
    expect(updateOrderStatusSchema.safeParse({ status: 'CANCELLED' }).success).toBe(false);
    expect(updateOrderStatusSchema.safeParse({ status: '' }).success).toBe(false);
    expect(updateOrderStatusSchema.safeParse({}).success).toBe(false);
  });
});

// ─── Inventory Validator ───────────────────────────────────────

describe('Inventory Validator', () => {
  it('accepts valid stock update', () => {
    const result = updateInventorySchema.safeParse({
      stockCount: 50,
      lowStockThreshold: 10,
    });
    expect(result.success).toBe(true);
  });

  it('rejects negative stock count', () => {
    const result = updateInventorySchema.safeParse({ stockCount: -5 });
    expect(result.success).toBe(false);
  });
});
