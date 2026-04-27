import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();
import CartService from './src/services/CartService';
import { CartCheckoutProcess } from './src/services/OrderService';

async function main() {
  const users = await prisma.user.findMany({ where: { role: 'CUSTOMER' }});
  if(users.length === 0) return;
  const customerId = users[0].id;
  
  const menuItems = await prisma.menuItem.findMany({ include: { inventoryItem: true } });
  const item = menuItems.find(i => i.inventoryItem && i.inventoryItem.stockCount > 0);
  if(!item) return;

  console.log(`Adding ${item.name} (stock: ${item.inventoryItem!.stockCount}) by 1`);
  
  // Try to bypass stock by adding 1 multiple times
  for (let i = 0; i < item.inventoryItem!.stockCount + 1; i++) {
    await CartService.addItemToCart(customerId, item.id, 1);
  }
  
  const cart = await CartService.getOrCreateCart(customerId);
  const cartItem = cart.items.find((i: any) => i.menuItemId === item.id);
  console.log(`Cart now has quantity: ${cartItem?.quantity}`);
  
  const process = new CartCheckoutProcess();
  try {
    await process.processOrder(customerId);
    console.log("Checkout succeeded (BUG)");
  } catch (err: any) {
    console.log(`Checkout failed: ${err.message}`);
  }
}
main().catch(console.error).finally(() => prisma.$disconnect());
