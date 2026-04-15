/**
 * PATTERN: Composite
 * PROBLEM: Menu has categories (Beverages, Food, Snacks) that contain items.
 *          Need uniform traversal — both categories and items should be treated
 *          the same way when rendering or calculating totals.
 * PARTICIPANTS:
 *   - MenuComponent (interface) — common contract
 *   - MenuCategoryComposite (composite) — contains children
 *   - MenuItemLeaf (leaf) — individual menu item
 * USED BY: Menu rendering on frontend, price calculations per category
 * 
 * SOLID: OCP — new component types can be added without modifying existing ones
 * SOLID: LSP — both MenuCategoryComposite and MenuItemLeaf satisfy MenuComponent
 */

/**
 * MenuComponent interface — the common contract for both
 * categories (composite) and items (leaf).
 * 
 * OOP: Polymorphism — any code that works with MenuComponent
 * works with both categories and items transparently.
 * SOLID: ISP — interface is small and focused
 */
export interface MenuComponent {
  getName(): string;
  getPrice(): number | null;
  isAvailable(): boolean;
  display(indent?: number): string;
  getChildren?(): MenuComponent[];
}

/**
 * MenuCategoryComposite — a composite node that contains children.
 * Children can be MenuItemLeaf nodes or other MenuCategoryComposite nodes.
 * 
 * OOP: Polymorphism — implements the same interface as MenuItemLeaf
 */
export class MenuCategoryComposite implements MenuComponent {
  private children: MenuComponent[] = [];

  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly description: string | null = null
  ) {}

  getName(): string {
    return this.name;
  }

  /**
   * A category doesn't have a single price.
   * Returns null to indicate it's a composite node.
   */
  getPrice(): null {
    return null;
  }

  /**
   * A category is available if at least one of its children is available.
   */
  isAvailable(): boolean {
    return this.children.some((child) => child.isAvailable());
  }

  /**
   * Display the category and all its children recursively.
   * Demonstrates the power of the Composite pattern — uniform traversal.
   */
  display(indent: number = 0): string {
    const prefix = '  '.repeat(indent);
    let output = `${prefix}📁 ${this.name}`;
    if (this.description) {
      output += ` — ${this.description}`;
    }
    output += '\n';
    for (const child of this.children) {
      output += child.display(indent + 1);
    }
    return output;
  }

  add(component: MenuComponent): void {
    this.children.push(component);
  }

  remove(component: MenuComponent): void {
    const index = this.children.indexOf(component);
    if (index !== -1) {
      this.children.splice(index, 1);
    }
  }

  getChildren(): MenuComponent[] {
    return [...this.children];
  }

  getId(): string {
    return this.id;
  }

  /**
   * Get total price of all available items in this category.
   * Recursive — works for nested categories too.
   */
  getTotalPrice(): number {
    return this.children.reduce((sum, child) => {
      const price = child.getPrice();
      return sum + (price ?? 0);
    }, 0);
  }
}

/**
 * MenuItemLeaf — a leaf node representing a single menu item.
 * 
 * OOP: Polymorphism — implements the same interface as MenuCategoryComposite
 */

export class MenuItemLeaf implements MenuComponent {
  constructor(
    private readonly id: string,
    private readonly name: string,
    private readonly price: number,
    private readonly description: string | null = null,
    private readonly stockCount: number = 0
  ) {}

  getName(): string {
    return this.name;
  }

  getPrice(): number {
    return this.price;
  }

  /**
   * An item is available if its stock count is greater than 0.
   * Checks inventory at the domain model level.
   */
  isAvailable(): boolean {
    return this.stockCount > 0;
  }

  display(indent: number = 0): string {
    const prefix = '  '.repeat(indent);
    const status = this.isAvailable() ? '✅' : '❌';
    return `${prefix}${status} ${this.name} — ₹${this.price} (stock: ${this.stockCount})\n`;
  }

  getId(): string {
    return this.id;
  }
}
