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



export default UserFactory;
