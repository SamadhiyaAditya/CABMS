import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import { CartCheckoutProcess } from './src/services/OrderService';

async function main() {
  const carts = await prisma.cart.findMany();
  if (carts.length === 0) {
    console.log("No carts found");
    return;
  }
  
  const process = new CartCheckoutProcess();
  for (const cart of carts) {
    try {
      console.log(`Checking out cart for customer: ${cart.customerId}`);
      const order = await process.processOrder(cart.customerId);
      console.log("Checkout success:", order.id);
    } catch (err: any) {
      console.error(`Checkout failed for ${cart.customerId}: ${err.message}`);
    }
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
