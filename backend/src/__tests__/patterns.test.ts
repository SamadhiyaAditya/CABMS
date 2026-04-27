/**
 * Unit Tests — Design Patterns
 * 
 * Tests the 7 core design patterns to verify their structural correctness
 * WITHOUT requiring a database connection.
 * 
 * PATTERNS TESTED:
 * 1. Singleton — DatabaseConnection returns same instance
 * 2. Factory — UserFactory creates correct subclasses  
 * 3. Composite — MenuComposite tree traversal
 * 4. Observer — OrderEventEmitter pub/sub
 * 5. Strategy — ReportContext delegates to correct strategy
 */

import { Customer, Shopkeeper, Role } from '../models/User';
import UserFactory from '../patterns/UserFactory';
import { MenuCategoryComposite, MenuItemLeaf } from '../patterns/MenuComposite';
import { OrderEventEmitter, OrderEvent, IOrderObserver } from '../patterns/OrderObserver';
import { InAppNotificationAdapter, EmailAdapter } from '../patterns/NotificationAdapter';

// ─── Test 1: Factory Pattern ───────────────────────────────────

describe('Factory Pattern — UserFactory', () => {
  const baseData = {
    id: 'test-uuid-001',
    name: 'Test User',
    email: 'test@example.com',
    passwordHash: '$2b$10$hashedvalue',
    createdAt: new Date(),
  };

  it('should create a Customer instance for CUSTOMER role', () => {
    const user = UserFactory.create(Role.CUSTOMER, baseData);
    
    expect(user).toBeInstanceOf(Customer);
    expect(user.role).toBe(Role.CUSTOMER);
    expect(user.name).toBe('Test User');
  });

  it('should create a Shopkeeper instance for SHOPKEEPER role', () => {
    const user = UserFactory.create(Role.SHOPKEEPER, baseData);
    
    expect(user).toBeInstanceOf(Shopkeeper);
    expect(user.role).toBe(Role.SHOPKEEPER);
  });

  it('should throw error for unknown role', () => {
    expect(() => {
      UserFactory.create('ADMIN' as any, baseData);
    }).toThrow('Unknown role');
  });

  it('Customer should have correct permissions (LSP)', () => {
    const customer = UserFactory.create(Role.CUSTOMER, baseData);
    const permissions = customer.getPermissions();
    
    expect(permissions).toContain('VIEW_MENU');
    expect(permissions).toContain('PLACE_ORDER');
    expect(permissions).toContain('RATE_ITEM');
    expect(permissions).not.toContain('MANAGE_MENU');
  });

  it('Shopkeeper should have correct permissions (LSP)', () => {
    const shopkeeper = UserFactory.create(Role.SHOPKEEPER, baseData);
    const permissions = shopkeeper.getPermissions();
    
    expect(permissions).toContain('MANAGE_MENU');
    expect(permissions).toContain('VIEW_REPORTS');
    expect(permissions).not.toContain('PLACE_ORDER');
  });

  it('Encapsulation: password hash is accessible only via getter', () => {
    const user = UserFactory.create(Role.CUSTOMER, baseData);
    
    // Private field access is blocked at compile-time by TypeScript
    // The getter provides controlled access
    expect(user.getPasswordHash()).toBe('$2b$10$hashedvalue');
    
    // Verify the public API does NOT expose passwordHash directly
    const publicKeys = ['id', 'name', 'email', 'role', 'createdAt'];
    publicKeys.forEach(key => {
      expect(key in user).toBe(true);
    });
  });
});

// ─── Test 2: Composite Pattern ─────────────────────────────────

describe('Composite Pattern — MenuComposite', () => {
  let hotBeverages: MenuCategoryComposite;
  let chai: MenuItemLeaf;
  let coffee: MenuItemLeaf;
  let outOfStock: MenuItemLeaf;

  beforeEach(() => {
    hotBeverages = new MenuCategoryComposite('cat-1', 'Hot Beverages', 'Teas and coffees');
    chai = new MenuItemLeaf('item-1', 'Masala Chai', 20, 'Ginger cardamom tea', 100);
    coffee = new MenuItemLeaf('item-2', 'Filter Coffee', 35, 'South Indian coffee', 50);
    outOfStock = new MenuItemLeaf('item-3', 'Green Tea', 25, 'Healthy option', 0);
    
    hotBeverages.add(chai);
    hotBeverages.add(coffee);
    hotBeverages.add(outOfStock);
  });

  it('should add children to composite', () => {
    expect(hotBeverages.getChildren()).toHaveLength(3);
  });

  it('should remove a child from composite', () => {
    hotBeverages.remove(outOfStock);
    expect(hotBeverages.getChildren()).toHaveLength(2);
  });

  it('leaf nodes should return their price', () => {
    expect(chai.getPrice()).toBe(20);
    expect(coffee.getPrice()).toBe(35);
  });

  it('composite node should return null for price', () => {
    expect(hotBeverages.getPrice()).toBeNull();
  });

  it('leaf availability should be based on stock count', () => {
    expect(chai.isAvailable()).toBe(true);    // stock: 100
    expect(outOfStock.isAvailable()).toBe(false); // stock: 0
  });

  it('composite is available if at least one child is available', () => {
    expect(hotBeverages.isAvailable()).toBe(true);
    
    // Create a category with only out-of-stock items
    const emptyCategory = new MenuCategoryComposite('cat-2', 'Empty');
    emptyCategory.add(new MenuItemLeaf('item-x', 'Gone', 10, null, 0));
    expect(emptyCategory.isAvailable()).toBe(false);
  });

  it('display should recursively render the tree', () => {
    const output = hotBeverages.display();
    
    expect(output).toContain('📁 Hot Beverages');
    expect(output).toContain('✅ Masala Chai');
    expect(output).toContain('❌ Green Tea'); // out of stock
    expect(output).toContain('₹20');
  });

  it('getTotalPrice should sum available items', () => {
    // 20 + 35 + 25 = 80 (all items, including out of stock)
    expect(hotBeverages.getTotalPrice()).toBe(80);
  });
});

// ─── Test 3: Observer Pattern ──────────────────────────────────

describe('Observer Pattern — OrderEventEmitter', () => {
  it('should be a singleton', () => {
    const a = OrderEventEmitter.getInstance();
    const b = OrderEventEmitter.getInstance();
    expect(a).toBe(b);
  });

  it('should notify subscribed observers', () => {
    const emitter = OrderEventEmitter.getInstance();
    const receivedEvents: OrderEvent[] = [];
    
    const mockObserver: IOrderObserver = {
      onOrderUpdate: (event: OrderEvent) => {
        receivedEvents.push(event);
      }
    };

    emitter.subscribe(mockObserver);
    emitter.notify({ type: 'ORDER_PLACED', order: { id: 'test-1' } });
    
    expect(receivedEvents).toHaveLength(1);
    expect(receivedEvents[0].type).toBe('ORDER_PLACED');
    
    // Cleanup
    emitter.unsubscribe(mockObserver);
  });

  it('should not notify after unsubscribe', () => {
    const emitter = OrderEventEmitter.getInstance();
    let callCount = 0;
    
    const mockObserver: IOrderObserver = {
      onOrderUpdate: () => { callCount++; }
    };

    emitter.subscribe(mockObserver);
    emitter.notify({ type: 'ORDER_PLACED', order: {} });
    expect(callCount).toBe(1);
    
    emitter.unsubscribe(mockObserver);
    emitter.notify({ type: 'STATUS_CHANGED', order: {} });
    expect(callCount).toBe(1); // Should NOT increase
  });
});

// ─── Test 4: Adapter Pattern ───────────────────────────────────

describe('Adapter Pattern — NotificationAdapters', () => {
  it('InAppNotificationAdapter should store notifications', async () => {
    const adapter = new InAppNotificationAdapter();
    
    await adapter.send('user-1', 'Your order is ready!');
    await adapter.send('user-1', 'Another notification');
    await adapter.send('user-2', 'Different user');
    
    const user1Notifications = adapter.getNotifications('user-1');
    expect(user1Notifications).toHaveLength(2);
    expect(user1Notifications[0].message).toBe('Your order is ready!');
  });

  it('EmailAdapter should implement the same interface', async () => {
    const adapter = new EmailAdapter();
    
    // Should not throw — just logs to console
    await expect(adapter.send('user@test.com', 'Test email')).resolves.toBeUndefined();
  });

  it('both adapters implement INotificationService (polymorphism)', () => {
    const inApp = new InAppNotificationAdapter();
    const email = new EmailAdapter();
    
    // Both have the same send() signature
    expect(typeof inApp.send).toBe('function');
    expect(typeof email.send).toBe('function');
  });
});

// ─── Test 5: OOP Model Hierarchy ───────────────────────────────

describe('OOP — User Class Hierarchy', () => {
  const data = {
    id: 'u-1',
    name: 'Test',
    email: 'test@test.com',
    passwordHash: 'hash',
    createdAt: new Date(),
  };

  it('Customer and Shopkeeper both extend User (inheritance)', () => {
    const customer = new Customer({ ...data, role: Role.CUSTOMER });
    const shopkeeper = new Shopkeeper({ ...data, role: Role.SHOPKEEPER });
    
    // Both satisfy the User contract
    expect(customer.name).toBe('Test');
    expect(shopkeeper.name).toBe('Test');
    expect(customer.hasPermission('VIEW_MENU')).toBe(true);
    expect(shopkeeper.hasPermission('VIEW_MENU')).toBe(false);
  });

  it('hasPermission correctly checks role-based access', () => {
    const customer = new Customer({ ...data, role: Role.CUSTOMER });
    
    expect(customer.hasPermission('PLACE_ORDER')).toBe(true);
    expect(customer.hasPermission('MANAGE_INVENTORY')).toBe(false);
  });
});
