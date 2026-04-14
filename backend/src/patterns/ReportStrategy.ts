/**
 * PATTERN: Strategy
 * PROBLEM: The Shopkeeper needs different kinds of reports (Sales, Inventory, Customer Activity).
 *          If we put this all in one Controller, it becomes a massive, rigid, unreadable if-else nightmare.
 * SOLUTION: Define an IReportStrategy interface. Let each specific report figure out its own calculation.
 * 
 * SOLID: Open/Closed Principle. If we want a new "Weekly Revenue Report", we just create a new
 *        Strategy class without touching existing code.
 */

import DatabaseConnection from '../config/DatabaseConnection';
import { PrismaClient } from '@prisma/client';

/**
 * 1. The Strategy Interface
 */
export interface IReportStrategy {
  generateReport(): Promise<any>;
}

/**
 * 2. Concrete Strategy A: Sales Report
 * Summarizes revenue grouping by Order configurations.
 */
export class SalesReportStrategy implements IReportStrategy {
  private prisma: PrismaClient = DatabaseConnection.getInstance();

  async generateReport() {
    const orders = await this.prisma.order.findMany({
      where: { status: 'PICKED_UP' },
      include: { items: { include: { menuItem: true } } }
    });

    let totalRevenue = 0;
    const itemSales: Record<string, { name: string; qtySold: number; revenue: number }> = {};

    orders.forEach((order: any) => {
      totalRevenue += Number(order.totalAmount);
      order.items.forEach((i: any) => {
        if (!itemSales[i.menuItemId]) {
          itemSales[i.menuItemId] = { name: i.menuItem.name, qtySold: 0, revenue: 0 };
        }
        itemSales[i.menuItemId].qtySold += i.quantity;
        itemSales[i.menuItemId].revenue += (i.quantity * Number(i.priceAtTime));
      });
    });

    return {
      type: 'SALES_ANALYTICS',
      totalRevenue,
      totalOrders: orders.length,
      breakdown: Object.values(itemSales).sort((a, b) => b.qtySold - a.qtySold) // sorted by most popular
    };
  }
}

/**
 * 3. Concrete Strategy B: Inventory Valuation
 * Calculates total capital tied up in stock + imminent risks.
 */
export class InventoryReportStrategy implements IReportStrategy {
  private prisma: PrismaClient = DatabaseConnection.getInstance();

  async generateReport() {
    const inventory = await this.prisma.inventoryItem.findMany({
      include: { menuItem: true }
    });

    let totalValue = 0;
    const criticalItems: string[] = [];

    const breakdown = inventory.map((inv: any) => {
      const stockValue = inv.stockCount * Number(inv.menuItem.price);
      totalValue += stockValue;

      if (inv.stockCount <= inv.lowStockThreshold) {
        criticalItems.push(inv.menuItem.name);
      }

      return {
        name: inv.menuItem.name,
        stockRemaining: inv.stockCount,
        capitalValue: stockValue,
        status: inv.stockCount <= inv.lowStockThreshold ? 'CRITICAL' : 'HEALTHY'
      };
    });

    return {
      type: 'INVENTORY_VALUATION',
      totalCapitalValue: totalValue,
      criticalRisks: criticalItems.length,
      criticalItemsList: criticalItems,
      breakdown
    };
  }
}

/**
 * 4. Concrete Strategy C: Top Ordered Items
 * Calculates the most popular items by total order frequency across all completed orders.
 */
export class TopItemsStrategy implements IReportStrategy {
  private prisma: PrismaClient = DatabaseConnection.getInstance();

  async generateReport() {
    const orders = await this.prisma.order.findMany({
      where: { status: 'PICKED_UP' },
      include: { items: { include: { menuItem: true } } }
    });

    const itemCounts: Record<string, { name: string; qtySold: number; revenue: number }> = {};
    
    orders.forEach((order: any) => {
      order.items.forEach((item: any) => {
        if (!itemCounts[item.menuItemId]) {
          itemCounts[item.menuItemId] = { name: item.menuItem.name, qtySold: 0, revenue: 0 };
        }
        itemCounts[item.menuItemId].qtySold += item.quantity;
        itemCounts[item.menuItemId].revenue += (item.quantity * Number(item.priceAtTime));
      });
    });

    const topItems = Object.values(itemCounts)
      .sort((a, b) => b.qtySold - a.qtySold)
      .slice(0, 10); // Top 10

    return {
      type: 'TOP_ITEMS_ANALYTICS',
      topItems
    };
  }
}

/**
 * 5. The Context
 * The Controller will use this class to execute the correct strategy dynamically.
 */
export class ReportContext {
  private strategy: IReportStrategy;

  constructor(strategy: IReportStrategy) {
    this.strategy = strategy;
  }

  public setStrategy(strategy: IReportStrategy) {
    this.strategy = strategy;
  }

  public async executeStrategy() {
    return await this.strategy.generateReport();
  }
}
