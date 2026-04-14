import { Request, Response } from 'express';
import { CartCheckoutProcess } from '../services/OrderService';
import DatabaseConnection from '../config/DatabaseConnection';
import { ValidationError, NotFoundError } from '../utils/errors';

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
   * Customer order history
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

  /**
   * GET /orders/all
   * Shopkeeper: View all orders across all customers
   */
  async getAllOrders(req: Request, res: Response) {
    const orders = await this.prisma.order.findMany({
      include: {
        customer: { select: { name: true, email: true } },
        items: { include: { menuItem: { select: { name: true } } } }
      },
      orderBy: { createdAt: 'desc' }
    });

    res.status(200).json({ success: true, orders });
  }

  /**
   * PATCH /orders/:id/status
   * Shopkeeper: Update order status (PENDING → READY → PICKED_UP)
   */
  async updateOrderStatus(req: Request, res: Response) {
    const id = req.params.id as string;
    const status = req.body.status as string;

    const validStatuses = ['PENDING', 'READY', 'PICKED_UP'];
    if (!status || !validStatuses.includes(status)) {
      throw new ValidationError(`Invalid status. Must be one of: ${validStatuses.join(', ')}`);
    }

    // Verify order exists
    const order = await this.prisma.order.findUnique({ where: { id } });
    if (!order) {
      throw new NotFoundError('Order not found');
    }

    // Enforce forward-only transitions: PENDING → READY → PICKED_UP
    const statusOrder = ['PENDING', 'READY', 'PICKED_UP'];
    const currentIndex = statusOrder.indexOf(order.status);
    const newIndex = statusOrder.indexOf(status);

    if (newIndex <= currentIndex) {
      throw new ValidationError(`Cannot move order from ${order.status} to ${status}. Status can only move forward.`);
    }

    const updated = await this.prisma.order.update({
      where: { id },
      data: { status: status as any },
      include: {
        customer: { select: { name: true } },
        items: { include: { menuItem: { select: { name: true } } } }
      }
    });

    // Notify Observers for real-time dashboard pushing
    import('../patterns/OrderObserver').then(({ OrderEventEmitter }) => {
      OrderEventEmitter.getInstance().notify({ type: 'STATUS_CHANGED', order: updated });
    });

    res.status(200).json({ success: true, order: updated });
  }

  /**
   * GET /orders/stream
   * Subscribe to Server-Sent Events (SSE) for Live Dashboard
   */
  async streamLiveOrders(req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');
    
    // Initial connection established
    res.write('data: {"message": "connected"}\n\n');

    import('../patterns/OrderObserver').then(({ liveDashboardUpdater }) => {
      liveDashboardUpdater.addClient(res);
    });
  }
}

export default new OrderController();
