/**
 * PATTERN: Factory
 * PROBLEM: Creating the right type of user (Customer or Shopkeeper) based on role
 *          during registration. The auth controller should not know construction
 *          details of each user type.
 * PARTICIPANTS: UserFactory (creator), Customer & Shopkeeper (products)
 * USED BY: AuthService.register() — delegates user creation to this factory
 * 
 * SOLID: OCP — adding a new role means adding a new case, not modifying Customer/Shopkeeper
 * SOLID: SRP — factory only handles user creation logic
 */

import { User, Customer, Shopkeeper, Role } from '../models/User';

export interface CreateUserDto {
  id: string;
  name: string;
  email: string;
  passwordHash: string;
  createdAt: Date;
}

class UserFactory {
  /**
   * Creates the correct User subclass based on the role.
   * 
   * OOP: Polymorphism — the returned object is typed as User
   * but is actually a Customer or Shopkeeper instance.
   * 
   * @param role - CUSTOMER or SHOPKEEPER
   * @param data - User data from database
   * @returns Customer or Shopkeeper instance
   */
  static create(role: Role, data: CreateUserDto): User {
    switch (role) {
      case Role.CUSTOMER:
        return new Customer({ ...data, role: Role.CUSTOMER });
      case Role.SHOPKEEPER:
        return new Shopkeeper({ ...data, role: Role.SHOPKEEPER });
      default:
        throw new Error(`Unknown role: ${role}`);
    }
  }
}



export default UserFactory;
