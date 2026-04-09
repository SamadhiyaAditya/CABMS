import { Request, Response } from 'express';
import { CartCheckoutProcess } from '../services/OrderService';
import DatabaseConnection from '../config/DatabaseConnection';

class OrderController {
  private prisma = DatabaseConnection.getInstance();

  /**
   * POST /orders/checkout
   * Bootstraps the Template Method completely processing the cart instantly.
   */
  async checkout(req: Request, res: Response) {
    const customerId = req.user!.userId;
    const processor = new CartCheckoutProcess();
    
    // Process completely handled via Template algorithm
    const newOrder = await processor.processOrder(customerId);

    res.status(201).json({ 
      success: true, 
      message: 'Order created successfully', 
      order: newOrder 
    });
  }

  /**
   * GET /orders/history
   * Customer history
   */
  async getMyOrders(req: Request, res: Response) {
    const customerId = req.user!.userId;
    const orders = await this.prisma.order.findMany({
      where: { customerId },
      include: {
        items: { include: { menuItem: { select: { name: true, imageUrl: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, orders });
  }
}

export default new OrderController();
