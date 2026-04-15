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

// -------------------------------------------------------------
// ORDER OBSERVER (Added for SSE Dashboard push IMP-05)
// -------------------------------------------------------------

export interface OrderEvent {
  type: 'ORDER_PLACED' | 'STATUS_CHANGED';
  order: any;
}

export interface IOrderObserver {
  onOrderUpdate(event: OrderEvent): void;
}

export class OrderEventEmitter {
  private static instance: OrderEventEmitter;
  private observers: IOrderObserver[] = [];

  private constructor() {}

  public static getInstance(): OrderEventEmitter {
    if (!OrderEventEmitter.instance) {
      OrderEventEmitter.instance = new OrderEventEmitter();
    }
    return OrderEventEmitter.instance;
  }

  public subscribe(observer: IOrderObserver) {
    this.observers.push(observer);
  }

  public unsubscribe(observer: IOrderObserver) {
    this.observers = this.observers.filter((o) => o !== observer);
  }

  public notify(event: OrderEvent) {
    this.observers.forEach((o) => o.onOrderUpdate(event));
  }
}

// -------------------------------------------------------------
// DASHBOARD UPDATER OBSERVER (SSE)
// -------------------------------------------------------------

import { Response } from 'express';

export class DashboardUpdater implements IOrderObserver {
  private clients: Response[] = [];

  constructor() {
    OrderEventEmitter.getInstance().subscribe(this);
  }

  public addClient(res: Response) {
    this.clients.push(res);
    res.on('close', () => {
      this.clients = this.clients.filter(c => c !== res);
    });
  }

  onOrderUpdate(event: OrderEvent): void {
    // Blast event to all connected dashboard SSE clients
    const dataString = `data: ${JSON.stringify(event)}\n\n`;
    this.clients.forEach(client => {
      client.write(dataString);
    });
  }
}

export const liveDashboardUpdater = new DashboardUpdater();
