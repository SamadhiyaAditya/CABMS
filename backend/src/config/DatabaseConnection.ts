/**
 * PATTERN: Singleton
 * PROBLEM: PrismaClient is expensive to instantiate — one instance must be shared app-wide.
 * PARTICIPANTS: DatabaseConnection (Singleton class)
 * USED BY: All service classes via DatabaseConnection.getInstance()
 * 
 * SOLID: SRP — this class only manages the database connection lifecycle
 */

import { PrismaClient } from '@prisma/client';



export default DatabaseConnection;
