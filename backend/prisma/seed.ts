import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';
const prisma = new PrismaClient();

async function main() {
  console.log(`Start seeding ...`);

  // Clean DB
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();

  // Create Category 1: Hot Beverages
  const hotDrinks = await prisma.menuCategory.create({
    data: { name: 'Hot Beverages', description: 'Classic College Chai & Coffees' }
  });

  // Create Category 2: Snacks
  const snacks = await prisma.menuCategory.create({
    data: { name: 'Quick Snacks', description: 'Bites between classes' }
  });

  // Item 1: Masala Chai
  await prisma.menuItem.create({
    data: {
      categoryId: hotDrinks.id,
      name: 'Masala Chai',
      description: 'Our signature ginger and cardamom infused tea.',
      price: 20,
      isAvailable: true,
      inventoryItem: {
        create: { stockCount: 150, lowStockThreshold: 20 }
      }
    }
  });

  // Item 2: Filter Coffee
  await prisma.menuItem.create({
    data: {
      categoryId: hotDrinks.id,
      name: 'Filter Coffee',
      description: 'Strong authentic South Indian filter coffee.',
      price: 35,
      isAvailable: true,
      inventoryItem: {
        create: { stockCount: 50, lowStockThreshold: 10 }
      }
    }
  });

  // Item 3: Samosa
  await prisma.menuItem.create({
    data: {
      categoryId: snacks.id,
      name: 'Punjabi Samosa',
      description: 'Crispy pastry filled with spiced potatoes.',
      price: 15,
      isAvailable: true,
      inventoryItem: {
        create: { stockCount: 100, lowStockThreshold: 10 }
      }
    }
  });

  console.log(`Seeding finished.`);
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
