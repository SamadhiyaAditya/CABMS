/**
 * PATTERN: Strategy (Reuse)
 * PROBLEM: Customers may want to sort menu items differently — by price, 
 *          by name, by popularity (most ordered). Hard-coding sort logic
 *          in the controller creates a rigid, hard-to-extend if-else chain.
 * SOLUTION: Define an IMenuSortStrategy interface with interchangeable 
 *           sort algorithm implementations. The controller selects the 
 *           right strategy based on the query parameter.
 * PARTICIPANTS:
 *   - IMenuSortStrategy (Interface)
 *   - SortByPrice, SortByName, SortByPopularity (Concrete Strategies)
 *   - MenuSortContext (Context — selects and executes the strategy)
 * USED BY: MenuController.getFullMenu (optional ?sort= query param)
 * 
 * SOLID:
 *   OCP — New sort strategies can be added without modifying existing ones.
 *   SRP — Each strategy handles exactly one sorting algorithm.
 *   DIP — Controller depends on the interface, not concrete sort classes.
 */

// ─── Interface ─────────────────────────────────────────────────

export interface IMenuSortStrategy {
  /** Sort menu items in-place or return sorted copy */
  sort(items: MenuItemForSort[]): MenuItemForSort[];
}

/** Lightweight type for sorting — avoids coupling to Prisma types */
export interface MenuItemForSort {
  id: string;
  name: string;
  price: number;
  isAvailable: boolean;
  orderCount?: number;
  [key: string]: any; // Allow extra fields to pass through
}

// ─── Concrete Strategies ───────────────────────────────────────

/**
 * Sort menu items by price (ascending by default).
 */
export class SortByPrice implements IMenuSortStrategy {
  constructor(private ascending: boolean = true) {}

  sort(items: MenuItemForSort[]): MenuItemForSort[] {
    return [...items].sort((a, b) => 
      this.ascending ? a.price - b.price : b.price - a.price
    );
  }
}

/**
 * Sort menu items alphabetically by name.
 */
export class SortByName implements IMenuSortStrategy {
  sort(items: MenuItemForSort[]): MenuItemForSort[] {
    return [...items].sort((a, b) => a.name.localeCompare(b.name));
  }
}

/**
 * Sort menu items by popularity (most ordered first).
 * Falls back to name sort if orderCount is not available.
 */
export class SortByPopularity implements IMenuSortStrategy {
  sort(items: MenuItemForSort[]): MenuItemForSort[] {
    return [...items].sort((a, b) => 
      (b.orderCount ?? 0) - (a.orderCount ?? 0)
    );
  }
}

// ─── Context ───────────────────────────────────────────────────

/**
 * MenuSortContext — selects the correct strategy from a query param string.
 * 
 * Usage in controller:
 *   const sorted = MenuSortContext.getSorted(items, req.query.sort as string);
 */
export class MenuSortContext {
  private static strategies: Record<string, IMenuSortStrategy> = {
    'price-asc': new SortByPrice(true),
    'price-desc': new SortByPrice(false),
    'name': new SortByName(),
    'popularity': new SortByPopularity(),
  };

  static getSorted(items: MenuItemForSort[], sortKey?: string): MenuItemForSort[] {
    if (!sortKey || !this.strategies[sortKey]) {
      return items; // No sort — return original order
    }
    return this.strategies[sortKey].sort(items);
  }

  /** List available sort options (useful for API docs) */
  static getAvailableSorts(): string[] {
    return Object.keys(this.strategies);
  }
}
