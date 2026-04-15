/**
 * PATTERN: Strategy
 * PROBLEM: The Shopkeeper needs different kinds of reports (Sales, Inventory, Customer Activity).
 *          If we put this all in one Controller, it becomes a massive, rigid, unreadable if-else nightmare.
 * SOLUTION: Define an IReportStrategy interface. Let each specific report figure out its own calculation.
 * 
 * SOLID: Open/Closed Principle. If we want a new "Weekly Revenue Report", we just create a new
 *        Strategy class without touching existing code.
 */

import DatabaseConnection from '../config/DatabaseConnection';
import { PrismaClient } from '@prisma/client';

/**
 * 1. The Strategy Interface
 */
