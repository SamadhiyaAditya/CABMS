/**
 * PATTERN: Singleton
 * PROBLEM: PrismaClient is expensive to instantiate — one instance must be shared app-wide.
 * PARTICIPANTS: DatabaseConnection (Singleton class)
 * USED BY: All service classes via DatabaseConnection.getInstance()
 * 
 * SOLID: SRP — this class only manages the database connection lifecycle
 */

import { PrismaClient } from '@prisma/client';

class DatabaseConnection {
  private static instance: PrismaClient;

  // Private constructor prevents direct instantiation
  private constructor() {}

  /**
   * Returns the single PrismaClient instance.
   * Creates it on first call, reuses on subsequent calls.
   */
  public static getInstance(): PrismaClient {
    if (!DatabaseConnection.instance) {
      DatabaseConnection.instance = new PrismaClient();
    }
    return DatabaseConnection.instance;
  }

  /**
   * Gracefully disconnect the database client.
   * Called during app shutdown.
   */
  public static async disconnect(): Promise<void> {
    if (DatabaseConnection.instance) {
      await DatabaseConnection.instance.$disconnect();
    }
  }
}

export default DatabaseConnection;
