/**
 * ReviewService — Review eligibility and management
 * 
 * OOP: Encapsulation — review eligibility logic is fully inside this service.
 *      The controller does not know how verification works — it just calls addReview().
 * SOLID: SRP — only handles review eligibility + creation. Does not touch 
 *         order status or inventory — those are separate services.
 */

import DatabaseConnection from '../config/DatabaseConnection';
import { ForbiddenError, NotFoundError, ConflictError } from '../utils/errors';

class ReviewService {
  private prisma = DatabaseConnection.getInstance();

  /**
   * Submit a review for a menu item.
   * 
   * CONSTRAINT: Only customers with at least one PICKED_UP order
   * containing the given menuItemId can review it.
   * This is the "purchase verification gate" from Section 6 of the spec.
   */
  async addReview(customerId: string, menuItemId: string, rating: number, comment?: string) {
    // 1. Verify the menu item exists
    const menuItem = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
    });

    if (!menuItem) {
      throw new NotFoundError('Menu item not found');
    }

    // 2. Check for existing review — enforced at DB level too (@@unique)
    const existingReview = await this.prisma.review.findUnique({
      where: {
        customerId_menuItemId: { customerId, menuItemId }
      }
    });

    if (existingReview) {
      throw new ConflictError('You have already reviewed this item');
    }

    // 3. PURCHASE VERIFICATION GATE
    //    Find a PICKED_UP order by this customer that contains this menu item.
    //    This prevents reviewing items you never actually bought.
    const qualifyingOrder = await this.prisma.order.findFirst({
      where: {
        customerId,
        status: 'PICKED_UP',
        items: {
          some: { menuItemId }
        }
      },
      select: { id: true }
    });

    if (!qualifyingOrder) {
      // Check if they have an order but it's not PICKED_UP yet
      const pendingOrder = await this.prisma.order.findFirst({
        where: {
          customerId,
          status: { in: ['PENDING', 'READY'] },
          items: {
            some: { menuItemId }
          }
        }
      });

      if (pendingOrder) {
        throw new ForbiddenError('Order not yet completed. You can review after pickup.');
      }

      throw new ForbiddenError('You have not purchased this item');
    }

    // 4. Create the review, linked to the qualifying order
    return await this.prisma.review.create({
      data: {
        rating,
        comment,
        customerId,
        menuItemId,
        orderId: qualifyingOrder.id, // Link to the actual purchase
      },
      include: {
        customer: { select: { name: true } },
        menuItem: { select: { name: true } },
      }
    });
  }

  /**
   * Get all reviews for a specific menu item.
   * Public endpoint — no auth required.
   */
  async getReviewsForMenu(menuItemId: string) {
    return await this.prisma.review.findMany({
      where: { menuItemId },
      include: {
        customer: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export default new ReviewService();
