import DatabaseConnection from '../config/DatabaseConnection';
import { NotFoundError, ValidationError, StockError } from '../utils/errors';

class CartService {
  private prisma = DatabaseConnection.getInstance();

  /**
   * Automatically fetches a Customer's active cart. If one doesn't exist, it creates one.
   * 1:1 Relationship strictly enforced.
   */
  async getOrCreateCart(customerId: string) {
    let cart = await this.prisma.cart.findUnique({
      where: { customerId },
      include: {
        items: {
          include: { menuItem: { include: { inventoryItem: true } } },
          orderBy: { id: 'asc' }
        }
      }
    });

    if (!cart) {
      cart = await this.prisma.cart.create({
        data: { customerId },
        include: { items: { include: { menuItem: { include: { inventoryItem: true } } } } }
      });
    }

    // Calculate dynamic totals for the frontend.
    // Price isn't stored in CartItem to prevent stale DB prices. It's fetched live!
    let total = 0;
    const formattedItems = cart.items.map((cartItem: any) => {
      const itemTotal = Number(cartItem.menuItem.price) * cartItem.quantity;
      total += itemTotal;
      return {
        id: cartItem.id,
        menuItemId: cartItem.menuItemId,
        name: cartItem.menuItem.name,
        price: Number(cartItem.menuItem.price),
        quantity: cartItem.quantity,
        itemTotal,
        isAvailable: cartItem.menuItem.isAvailable,
        stockCount: cartItem.menuItem.inventoryItem?.stockCount || 0
      };
    });

    return {
      id: cart.id,
      items: formattedItems,
      totalAmount: total
    };
  }

  async addItemToCart(customerId: string, menuItemId: string, quantity: number) {
    const rawCart = await this.getOrCreateCart(customerId);
    
    // Verify item exists and is in stock
    const item = await this.prisma.menuItem.findUnique({
      where: { id: menuItemId },
      include: { inventoryItem: true }
    });

    if (!item) throw new NotFoundError('Menu item not found');
    if (!item.isAvailable || (item.inventoryItem && item.inventoryItem.stockCount < quantity)) {
      throw new StockError('Not enough stock available for this item');
    }

    // Use Prisma Upsert for atomic check-and-act to prevent 409 Conflict (P2002)
    return await this.prisma.cartItem.upsert({
      where: {
        cartId_menuItemId: { cartId: rawCart.id, menuItemId }
      },
      update: {
        quantity: { increment: quantity }
      },
      create: {
        cartId: rawCart.id,
        menuItemId,
        quantity
      }
    });
  }

  async updateItemQuantity(customerId: string, cartItemId: string, quantity: number) {
    // If quantity is 0, delete it
    if (quantity === 0) {
      return await this.removeItemFromCart(customerId, cartItemId);
    }

    const cart = await this.getOrCreateCart(customerId);
    const cartItem = await this.prisma.cartItem.findFirst({
      where: { id: cartItemId, cartId: cart.id },
      include: { menuItem: { include: { inventoryItem: true } } }
    });

    if (!cartItem) throw new NotFoundError('Item not in cart');

    if (cartItem.menuItem.inventoryItem && cartItem.menuItem.inventoryItem.stockCount < quantity) {
      throw new StockError(`Only ${cartItem.menuItem.inventoryItem.stockCount} units available in stock`);
    }

    return await this.prisma.cartItem.update({
      where: { id: cartItemId },
      data: { quantity }
    });
  }

  async removeItemFromCart(customerId: string, cartItemId: string) {
    const cart = await this.getOrCreateCart(customerId);
    await this.prisma.cartItem.deleteMany({
      where: { id: cartItemId, cartId: cart.id }
    });
  }
}

export default new CartService();
