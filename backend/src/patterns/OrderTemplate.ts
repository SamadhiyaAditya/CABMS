/**
 * PATTERN: Template Method
 * PROBLEM: Order processing must always happen in a strict sequential order.
 *          If steps are skipped, cart might corrupt or inventory might over-draft.
 * PARTICIPANTS: OrderTemplate (Abstract Base) and CartCheckoutProcess (Concrete Class).
 * 
 * SOLID: Open/Closed Principle — new checkout variants can just extend OrderTemplate
 * but the core algorithm cannot be modified.
 */



  // ─────────────────────────────────────────────
  // Abstract Hooks (Concrete execution defined in child classes)
  // ─────────────────────────────────────────────

  protected abstract fetchData(customerId: string): Promise<any>;
  
  protected abstract validate(data: any): void;
  
  protected abstract reserveInventory(tx: any, data: any): Promise<void>;
  
  protected abstract createOrderRecord(tx: any, customerId: string, data: any): Promise<any>;

  protected abstract postOrderCleanup(tx: any, data: any): Promise<void>;

  protected abstract triggerNotifications(orderData: any): Promise<void>;
}
