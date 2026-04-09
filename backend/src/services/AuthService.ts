/**
 * AuthService — Core authentication business logic
 * 
 * SOLID: SRP — only handles authentication (register, login, profile)
 * SOLID: DIP — depends on Prisma abstraction via DatabaseConnection Singleton
 * 
 * OOP: Encapsulation — password hashing logic is internal to this service
 */

import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import DatabaseConnection from '../config/DatabaseConnection';
import UserFactory from '../patterns/UserFactory';
import { Role, User } from '../models/User';
import { env } from '../config/env';
import { AuthError, ConflictError, NotFoundError } from '../utils/errors';
import type { RegisterInput, LoginInput } from '../validators/authValidator';

const SALT_ROUNDS = 10;

class AuthService {
  private prisma = DatabaseConnection.getInstance();

  /**
   * Register a new user.
   * Uses Factory pattern to create the correct User subclass.
   */
  async register(data: RegisterInput): Promise<{ user: User; token: string }> {
    // Check for duplicate email
    const existing = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (existing) {
      throw new ConflictError('Email already registered');
    }

    // Hash password — OOP: Encapsulation (hashing is internal to AuthService)
    const passwordHash = await bcrypt.hash(data.password, SALT_ROUNDS);

    // Create user in database
    const dbUser = await this.prisma.user.create({
      data: {
        name: data.name,
        email: data.email,
        passwordHash,
        role: data.role as Role,
      },
    });

    // Factory pattern — creates the correct User subclass based on role
    const user = UserFactory.create(dbUser.role as Role, {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      passwordHash: dbUser.passwordHash,
      createdAt: dbUser.createdAt,
    });

    // Generate JWT
    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Login with email and password.
   * Returns JWT on success.
   */
  async login(data: LoginInput): Promise<{ user: User; token: string }> {
    const dbUser = await this.prisma.user.findUnique({
      where: { email: data.email },
    });

    if (!dbUser) {
      throw new AuthError('Invalid credentials');
    }

    // Verify password
    const isValid = await bcrypt.compare(data.password, dbUser.passwordHash);
    if (!isValid) {
      throw new AuthError('Invalid credentials');
    }

    // Factory pattern — creates the correct User subclass
    const user = UserFactory.create(dbUser.role as Role, {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      passwordHash: dbUser.passwordHash,
      createdAt: dbUser.createdAt,
    });

    const token = this.generateToken(user);

    return { user, token };
  }

  /**
   * Get user profile by ID.
   */
  async getProfile(userId: string): Promise<User> {
    const dbUser = await this.prisma.user.findUnique({
      where: { id: userId },
    });

    if (!dbUser) {
      throw new NotFoundError('User not found');
    }

    return UserFactory.create(dbUser.role as Role, {
      id: dbUser.id,
      name: dbUser.name,
      email: dbUser.email,
      passwordHash: dbUser.passwordHash,
      createdAt: dbUser.createdAt,
    });
  }

  /**
   * Generate a JWT token for a user.
   * Token contains userId and role — used by auth middleware.
   */
  private generateToken(user: User): string {
    return jwt.sign(
      { userId: user.id, role: user.role },
      env.JWT_SECRET,
      { expiresIn: env.JWT_EXPIRES_IN as any }
    );
  }
}

export default new AuthService();
