/**
 * CAMS — Database Seed File
 * 
 * Creates realistic Chai Adda demo data for presentations:
 * - 1 Shopkeeper account + 2 Customer accounts
 * - 4 Menu Categories with 10 Menu Items
 * - Inventory for all items
 * - Orders in all 3 statuses (PENDING, READY, PICKED_UP)
 * - Sample reviews from customers
 * 
 * Usage: npx prisma db seed
 * 
 * Demo Credentials:
 *   Shopkeeper: shopkeeper@chaiadda.com / password123
 *   Customer 1: test@customer.com / password123
 *   Customer 2: anant@college.edu / password123
 */

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcrypt';

const prisma = new PrismaClient();

async function main() {
  console.log('🌱 Starting CAMS seed...\n');

  // ─── Clean DB (order matters for FK constraints) ───
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.user.deleteMany();
  console.log('  ✅ Database cleaned');

  // ─── Create Users ───
  const passwordHash = await bcrypt.hash('password123', 10);

  const shopkeeper = await prisma.user.create({
    data: {
      name: 'Chai Adda Admin',
      email: 'shopkeeper@chaiadda.com',
      passwordHash,
      role: 'SHOPKEEPER',
    },
  });
  console.log(`  ✅ Shopkeeper: ${shopkeeper.email}`);

  const customer1 = await prisma.user.create({
    data: {
      name: 'Aditya Samadhiya',
      email: 'test@customer.com',
      passwordHash,
      role: 'CUSTOMER',
    },
  });

  const customer2 = await prisma.user.create({
    data: {
      name: 'Anant Pratap',
      email: 'anant@college.edu',
      passwordHash,
      role: 'CUSTOMER',
    },
  });
  console.log(`  ✅ Customers: ${customer1.email}, ${customer2.email}`);

  // ─── Create Categories ───
  const hotBeverages = await prisma.menuCategory.create({
    data: { name: 'Hot Beverages', description: 'Classic Chai Adda teas and coffees' },
  });

  const coldDrinks = await prisma.menuCategory.create({
    data: { name: 'Cold Drinks', description: 'Refreshing cold beverages' },
  });

  const snacks = await prisma.menuCategory.create({
    data: { name: 'Quick Snacks', description: 'Bites to go with your chai' },
  });

  const combos = await prisma.menuCategory.create({
    data: { name: 'Combos', description: 'Value deals — chai + snack bundles' },
  });
  console.log('  ✅ 4 Categories created');

  // ─── Create Menu Items with Inventory ───
  const items: any[] = [];

  // Hot Beverages (4 items)
  items.push(await prisma.menuItem.create({
    data: {
      categoryId: hotBeverages.id,
      name: 'Masala Chai',
      description: 'Our signature ginger and cardamom infused tea.',
      price: 20,
      isAvailable: true,
      inventoryItem: { create: { stockCount: 150, lowStockThreshold: 20 } },
    },
  }));

  items.push(await prisma.menuItem.create({
    data: {
      categoryId: hotBeverages.id,
      name: 'Filter Coffee',
      description: 'Strong authentic South Indian filter coffee.',
      price: 35,
      isAvailable: true,
      inventoryItem: { create: { stockCount: 50, lowStockThreshold: 10 } },
    },
  }));

  items.push(await prisma.menuItem.create({
    data: {
      categoryId: hotBeverages.id,
      name: 'Green Tea',
      description: 'Light and healthy green tea with a hint of lemon.',
      price: 25,
      isAvailable: true,
      inventoryItem: { create: { stockCount: 40, lowStockThreshold: 8 } },
    },
  }));

  items.push(await prisma.menuItem.create({
    data: {
      categoryId: hotBeverages.id,
      name: 'Hot Chocolate',
      description: 'Rich and creamy cocoa — perfect for cold evenings.',
      price: 45,
      isAvailable: true,
      inventoryItem: { create: { stockCount: 30, lowStockThreshold: 5 } },
    },
  }));

  // Cold Drinks (2 items)
  items.push(await prisma.menuItem.create({
    data: {
      categoryId: coldDrinks.id,
      name: 'Iced Lemon Tea',
      description: 'Chilled tea with fresh lemon and mint.',
      price: 30,
      isAvailable: true,
      inventoryItem: { create: { stockCount: 60, lowStockThreshold: 10 } },
    },
  }));

  items.push(await prisma.menuItem.create({
    data: {
      categoryId: coldDrinks.id,
      name: 'Cold Coffee',
      description: 'Blended iced coffee with milk and cream.',
      price: 50,
      isAvailable: true,
      inventoryItem: { create: { stockCount: 25, lowStockThreshold: 5 } },
    },
  }));

  // Snacks (3 items)
  items.push(await prisma.menuItem.create({
    data: {
      categoryId: snacks.id,
      name: 'Punjabi Samosa',
      description: 'Crispy pastry filled with spiced potatoes.',
      price: 15,
      isAvailable: true,
      inventoryItem: { create: { stockCount: 100, lowStockThreshold: 15 } },
    },
  }));

  items.push(await prisma.menuItem.create({
    data: {
      categoryId: snacks.id,
      name: 'Bread Pakora',
      description: 'Deep-fried spiced bread slices — campus classic.',
      price: 20,
      isAvailable: true,
      inventoryItem: { create: { stockCount: 80, lowStockThreshold: 10 } },
    },
  }));

  items.push(await prisma.menuItem.create({
    data: {
      categoryId: snacks.id,
      name: 'Veg Sandwich',
      description: 'Fresh grilled sandwich with cheese and veggies.',
      price: 40,
      isAvailable: true,
      inventoryItem: { create: { stockCount: 35, lowStockThreshold: 5 } },
    },
  }));

  // Combos (1 item)
  items.push(await prisma.menuItem.create({
    data: {
      categoryId: combos.id,
      name: 'Chai + Samosa Combo',
      description: 'The ultimate Chai Adda deal — 1 Masala Chai + 1 Samosa.',
      price: 30,
      isAvailable: true,
      inventoryItem: { create: { stockCount: 50, lowStockThreshold: 10 } },
    },
  }));

  console.log(`  ✅ ${items.length} Menu Items created with inventory`);

  // ─── Create Orders in Different Statuses ───

  // Order 1: PICKED_UP (completed) — by customer1
  const order1 = await prisma.order.create({
    data: {
      customerId: customer1.id,
      status: 'PICKED_UP',
      totalAmount: 55,
      items: {
        create: [
          { menuItemId: items[0].id, quantity: 1, priceAtTime: 20 }, // Masala Chai
          { menuItemId: items[1].id, quantity: 1, priceAtTime: 35 }, // Filter Coffee
        ],
      },
    },
  });

  // Order 2: READY — by customer2
  const order2 = await prisma.order.create({
    data: {
      customerId: customer2.id,
      status: 'READY',
      totalAmount: 65,
      items: {
        create: [
          { menuItemId: items[6].id, quantity: 2, priceAtTime: 15 }, // 2x Samosa
          { menuItemId: items[1].id, quantity: 1, priceAtTime: 35 }, // Filter Coffee
        ],
      },
    },
  });

  // Order 3: PENDING — by customer1
  const order3 = await prisma.order.create({
    data: {
      customerId: customer1.id,
      status: 'PENDING',
      totalAmount: 70,
      items: {
        create: [
          { menuItemId: items[9].id, quantity: 1, priceAtTime: 30 }, // Combo
          { menuItemId: items[8].id, quantity: 1, priceAtTime: 40 }, // Sandwich
        ],
      },
    },
  });

  // Order 4: PICKED_UP (older) — by customer2
  const order4 = await prisma.order.create({
    data: {
      customerId: customer2.id,
      status: 'PICKED_UP',
      totalAmount: 45,
      items: {
        create: [
          { menuItemId: items[3].id, quantity: 1, priceAtTime: 45 }, // Hot Chocolate
        ],
      },
    },
  });

  console.log('  ✅ 4 Orders created (1 PENDING, 1 READY, 2 PICKED_UP)');

  // ─── Create Reviews (only for PICKED_UP orders) ───
  await prisma.review.create({
    data: {
      customerId: customer1.id,
      menuItemId: items[0].id, // Masala Chai
      orderId: order1.id,
      rating: 5,
      comment: 'Best chai on campus! The ginger and cardamom hit perfectly.',
    },
  });

  await prisma.review.create({
    data: {
      customerId: customer1.id,
      menuItemId: items[1].id, // Filter Coffee
      orderId: order1.id,
      rating: 4,
      comment: 'Strong and authentic. Could be a bit hotter.',
    },
  });

  await prisma.review.create({
    data: {
      customerId: customer2.id,
      menuItemId: items[3].id, // Hot Chocolate
      orderId: order4.id,
      rating: 5,
      comment: 'Creamy and rich — my go-to winter drink!',
    },
  });

  console.log('  ✅ 3 Reviews created');

  console.log('\n🎉 Seed complete! Demo credentials:');
  console.log('   Shopkeeper: shopkeeper@chaiadda.com / password123');
  console.log('   Customer 1: test@customer.com / password123');
  console.log('   Customer 2: anant@college.edu / password123\n');
}

main()
  .catch((e) => {
    console.error('❌ Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
