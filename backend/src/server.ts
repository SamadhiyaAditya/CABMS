/**
 * Server Entry Point
 * 
 * Starts the Express server and connects to the database.
 * Handles graceful shutdown on SIGTERM/SIGINT.
 */

import app from './app';
import { env } from './config/env';
import DatabaseConnection from './config/DatabaseConnection';

const PORT = env.PORT;

async function main(): Promise<void> {
  // Verify database connection
  const prisma = DatabaseConnection.getInstance();
  await prisma.$connect();
  console.log('✅ Database connected');

  // Start server
  const server = app.listen(PORT, () => {
    console.log(`☕ CAMS API running on http://localhost:${PORT}`);
    console.log(`   Health check: http://localhost:${PORT}/health`);
  });

  // Graceful shutdown
  const shutdown = async () => {
    console.log('\n🛑 Shutting down...');
    server.close();
    await DatabaseConnection.disconnect();
    process.exit(0);
  };

  process.on('SIGTERM', shutdown);
  process.on('SIGINT', shutdown);
}

main().catch((err) => {
  console.error('❌ Failed to start server:', err);
  process.exit(1);
});
