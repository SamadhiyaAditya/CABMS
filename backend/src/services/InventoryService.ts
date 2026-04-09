/**
 * InventoryService
 * Manages the stock quantities of MenuItems.
 * 
 * Uses S.O.L.I.D. Open/Closed by relying on the Observer pattern (IStockSubject).
 */
import DatabaseConnection from '../config/DatabaseConnection';
import { NotFoundError, ValidationError } from '../utils/errors';
import { IStockSubject, IStockObserver, LowStockEvent } from '../patterns/OrderObserver';

class InventoryService implements IStockSubject {
  private prisma = DatabaseConnection.getInstance();
  private observers: IStockObserver[] = [];

  // Subject methods (Observer pattern)
  addObserver(observer: IStockObserver): void {
    this.observers.push(observer);
  }

  removeObserver(observer: IStockObserver): void {
    this.observers = this.observers.filter((obs) => obs !== observer);
  }

  notifyObservers(event: LowStockEvent): void {
    for (const obs of this.observers) {
      obs.onLowStock(event);
    }
  }

  /**
   * Retrieves all inventory items with their relationships.
   */
  async getAllInventory() {
    return await this.prisma.inventoryItem.findMany({
      include: {
        menuItem: {
          select: { name: true, category: { select: { name: true } } }
        }
      },
      orderBy: { stockCount: 'asc' } // Show lowest stock first
    });
  }

  /**
   * Update the stock logic, and formally trigger alerts safely.
   */
  async updateStock(menuItemId: string, newStockCount?: number, threshold?: number) {
    const item = await this.prisma.inventoryItem.findUnique({
      where: { menuItemId },
      include: { menuItem: true }
    });

    if (!item) {
      throw new NotFoundError('Inventory record not found for this item.');
    }

    const updatedData: any = {};
    if (newStockCount !== undefined) updatedData.stockCount = newStockCount;
    if (threshold !== undefined) updatedData.lowStockThreshold = threshold;

    const updatedItem = await this.prisma.inventoryItem.update({
      where: { menuItemId },
      data: updatedData,
      include: { menuItem: true }
    });

    // Observer trigger logic
    if (updatedItem.stockCount <= updatedItem.lowStockThreshold) {
      this.notifyObservers({
        menuItemId: updatedItem.menuItemId,
        itemName: updatedItem.menuItem.name,
        currentStock: updatedItem.stockCount,
        threshold: updatedItem.lowStockThreshold,
      });
      
      // Auto-mark item unavailable if it hits 0
      if (updatedItem.stockCount === 0 && updatedItem.menuItem.isAvailable) {
        await this.prisma.menuItem.update({
          where: { id: menuItemId },
          data: { isAvailable: false }
        });
      }
    } else if (updatedItem.stockCount > 0 && !updatedItem.menuItem.isAvailable) {
      // Auto-mark item available again if restocked
      await this.prisma.menuItem.update({
        where: { id: menuItemId },
        data: { isAvailable: true }
      });
    }

    return updatedItem;
  }
}

// Export as Singleton-like instance (Service Layer Singleton)
export default new InventoryService();
