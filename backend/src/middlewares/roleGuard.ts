/**
 * Role Guard Middleware
 * 
 * Checks req.user.role after JWT validation.
 * Applied to every shopkeeper/customer-specific route.
 * Frontend check is just UX; this API check is SECURITY (RISK-02 fix).
 * 
 * SOLID: SRP — only handles role checking
 */

import { Request, Response, NextFunction } from 'express';
import { ForbiddenError } from '../utils/errors';

/**
 * Middleware: requireShopkeeper
 * Blocks any non-SHOPKEEPER user from accessing the route.
 */
export const requireShopkeeper = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'SHOPKEEPER') {
    throw new ForbiddenError('Only shopkeepers can access this resource');
  }
  next();
};

/**
 * Middleware: requireCustomer
 * Blocks any non-CUSTOMER user from accessing the route.
 */
export const requireCustomer = (req: Request, _res: Response, next: NextFunction): void => {
  if (req.user?.role !== 'CUSTOMER') {
    throw new ForbiddenError('Only customers can access this resource');
  }
  next();
};
