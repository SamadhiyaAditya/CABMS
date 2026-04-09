/**
 * PATTERN: Observer (Interfaces)
 * PROBLEM: We want the inventory to alert the shopkeeper cleanly when stock drops low, 
 * without entangling the Inventory code strictly to an email or UI system.
 * 
 * SOLID: Open/Closed Principle
 */

/**
 * The specific event that happens when a stock goes below a threshold.
 */
export interface LowStockEvent {
  menuItemId: string;
  itemName: string;
  currentStock: number;
  threshold: number;
}

/**
 * Any class that wants to 'listen' to low stock alerts implements this.
 */
export interface IStockObserver {
  onLowStock(event: LowStockEvent): void;
}

/**
 * The Subject (Inventory Service) will implement this to manage listeners.
 */
export interface IStockSubject {
  addObserver(observer: IStockObserver): void;
  removeObserver(observer: IStockObserver): void;
  notifyObservers(event: LowStockEvent): void;
}

/**
 * A concrete Observer: Logs to console. 
 * In Sprint 4, we could add a WebSocket UI Observer or Email Observer here!
 */
export class ShopkeeperConsoleAlertObserver implements IStockObserver {
  onLowStock(event: LowStockEvent): void {
    console.warn(
      `[ALERT] 🚨 Low Stock Warning: ${event.itemName} only has ${event.currentStock} left! (Threshold: ${event.threshold})`
    );
  }
}
