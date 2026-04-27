import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
async function main() {
  const carts = await prisma.cartItem.findMany({ include: { menuItem: { include: { inventoryItem: true } } } });
  let hasError = false;
  for (const c of carts) {
    if (c.menuItem && c.menuItem.inventoryItem) {
      if (c.quantity > c.menuItem.inventoryItem.stockCount) {
        console.log(`Cart item ${c.id} exceeds stock: ${c.quantity} > ${c.menuItem.inventoryItem.stockCount}`);
        hasError = true;
      }
    }
  }
  if (!hasError) console.log("All cart items have valid stock counts.");
}
main().catch(console.error).finally(() => prisma.$disconnect());
