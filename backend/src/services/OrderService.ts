import { OrderTemplate } from '../patterns/OrderTemplate';
import CartService from './CartService';
import InventoryService from './InventoryService';
import { InAppNotificationAdapter } from '../patterns/NotificationAdapter';
import { ValidationError, StockError, NotFoundError } from '../utils/errors';

export class CartCheckoutProcess extends OrderTemplate {
  private notifier = new InAppNotificationAdapter();

  protected async fetchData(customerId: string): Promise<any> {
    const cart = await CartService.getOrCreateCart(customerId);
    if (!cart.items || cart.items.length === 0) {
      throw new ValidationError('Cart is empty. Cannot checkout.');
    }
    return cart; // This becomes `rawData`
  }

  protected validate(cart: any): void {
    // Ensuring every item is still available before charging or reserving
    for (const item of cart.items) {
      if (!item.isAvailable) {
        throw new ValidationError(`Item "${item.name}" is no longer available.`);
      }
    }
  }

  protected async reserveInventory(tx: any, cart: any): Promise<void> {
    // We actively lock the rows and decrement simultaneously utilizing Prisma constraints
    for (const item of cart.items) {
      const inventory = await tx.inventoryItem.findUnique({ where: { menuItemId: item.menuItemId }});
      if (!inventory || inventory.stockCount < item.quantity) {
        throw new StockError(`CRITICAL: Stock mismatch for ${item.name} during checkout phase.`);
      }

      await tx.inventoryItem.update({
        where: { menuItemId: item.menuItemId },
        data: { stockCount: { decrement: item.quantity } }
      });
    }
  }

  protected async createOrderRecord(tx: any, customerId: string, cart: any): Promise<any> {
    // Generate Order
    const order = await tx.order.create({
      data: {
        customerId,
        totalAmount: cart.totalAmount,
        status: 'PENDING',
        items: {
          create: cart.items.map((cartItem: any) => ({
            menuItemId: cartItem.menuItemId,
            quantity: cartItem.quantity,
            priceAtTime: cartItem.price 
          }))
        }
      },
      include: { items: true }
    });

    return order;
  }

  protected async postOrderCleanup(tx: any, cart: any): Promise<void> {
    // Clear Customer Cart completely
    await tx.cartItem.deleteMany({
      where: { cartId: cart.id }
    });
  }

  protected async triggerNotifications(orderData: any): Promise<void> {
    // Adapter Pattern routing notification logic.
    await this.notifier.send(
      orderData.customerId, 
      `Your Chai Adda order #${orderData.id} totaling ₹${orderData.totalAmount} has been placed!`
    );

    // Additionally, force an active check on Inventory Observers incase doing this checkout breached a Low Stock threshold.
    // We fire this asynchronously completely disconnected from the blocking order process
    for (const item of orderData.items) {
      InventoryService.updateStock(item.menuItemId).catch(()=>null);
    }
  }
}
