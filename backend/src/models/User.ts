/**
 * OOP Model: User Class Hierarchy
 * 
 * CONCEPTS DEMONSTRATED:
 * - Abstraction: User base class hides auth details behind abstract methods
 * - Inheritance: Customer and Shopkeeper extend User
 * - Polymorphism: getPermissions() returns different values based on role
 * - Encapsulation: Internal state (passwordHash) is private
 * 
 * SOLID: LSP — Customer and Shopkeeper are substitutable wherever User is expected
 * SOLID: SRP — User only defines the user contract, no business logic
 */

// Permission types for role-based access control
export type Permission =
  | 'VIEW_MENU'
  | 'PLACE_ORDER'
  | 'VIEW_HISTORY'
  | 'RATE_ITEM'
  | 'MANAGE_MENU'
  | 'MANAGE_INVENTORY'
  | 'UPDATE_ORDER_STATUS'
  | 'VIEW_REPORTS';

export enum Role {
  CUSTOMER = 'CUSTOMER',
  SHOPKEEPER = 'SHOPKEEPER',
}

/**
 * Abstract User base class.
 * Cannot be instantiated directly — must use Customer or Shopkeeper.
 * 
 * OOP: Abstraction — defines the contract without implementation details
 */
export abstract class User {
  public readonly id: string;
  public readonly name: string;
  public readonly email: string;
  private readonly _passwordHash: string;
  public readonly role: Role;
  public readonly createdAt: Date;

  constructor(data: {
    id: string;
    name: string;
    email: string;
    passwordHash: string;
    role: Role;
    createdAt: Date;
  }) {
    this.id = data.id;
    this.name = data.name;
    this.email = data.email;
    this._passwordHash = data.passwordHash;
    this.role = data.role;
    this.createdAt = data.createdAt;
  }

  /**
   * Abstract method — each subclass defines its own permissions.
   * OOP: Polymorphism — same method signature, different implementations.
   */
  abstract getPermissions(): Permission[];

  /**
   * OOP: Encapsulation — passwordHash is private, access only through this method
   */
  public getPasswordHash(): string {
    return this._passwordHash;
  }

  /**
   * Check if this user has a specific permission.
   */
  public hasPermission(permission: Permission): boolean {
    return this.getPermissions().includes(permission);
  }
}

/**
 * Customer — extends User with customer-specific permissions.
 * OOP: Inheritance — inherits all User fields and methods.
 * SOLID: LSP — can be used anywhere a User is expected.
 */
export class Customer extends User {
  getPermissions(): Permission[] {
    return ['VIEW_MENU', 'PLACE_ORDER', 'VIEW_HISTORY', 'RATE_ITEM'];
  }
}

/**
 * Shopkeeper — extends User with shopkeeper-specific permissions.
 * OOP: Inheritance — inherits all User fields and methods.
 * SOLID: LSP — can be used anywhere a User is expected.
 */
export class Shopkeeper extends User {
  getPermissions(): Permission[] {
    return ['MANAGE_MENU', 'MANAGE_INVENTORY', 'UPDATE_ORDER_STATUS', 'VIEW_REPORTS'];
  }
}
