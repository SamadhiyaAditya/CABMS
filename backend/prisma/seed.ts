/**
 * CAMS — Database Seed File
 * 
 * Creates realistic Chai Adda demo data for presentations:
 * - 1 Shopkeeper account + 2 Customer accounts
 * - Full Menu Categories based on Chai Adda Menu
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
  console.log('Starting CAMS seed...\n');

  // Clean DB
  await prisma.review.deleteMany();
  await prisma.cartItem.deleteMany();
  await prisma.cart.deleteMany();
  await prisma.orderItem.deleteMany();
  await prisma.order.deleteMany();
  await prisma.inventoryItem.deleteMany();
  await prisma.menuItem.deleteMany();
  await prisma.menuCategory.deleteMany();
  await prisma.user.deleteMany();
  console.log('  Database cleaned');

  // Create Users
  const passwordHash = await bcrypt.hash('password123', 10);

  const shopkeeper = await prisma.user.create({
    data: {
      name: 'Chai Adda Admin',
      email: 'shopkeeper@chaiadda.com',
      passwordHash,
      role: 'SHOPKEEPER',
    },
  });
  console.log(`  Shopkeeper: ${shopkeeper.email}`);

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
  console.log(`  Customers: ${customer1.email}, ${customer2.email}`);

  // Create Categories
  const catBeverages = await prisma.menuCategory.create({ data: { name: 'Beverages', description: 'Tea, Coffee and more' } });
  const catShakes = await prisma.menuCategory.create({ data: { name: 'Shakes & Juices', description: 'Fresh shakes and juices' } });
  const catBurgers = await prisma.menuCategory.create({ data: { name: 'Burgers', description: 'Delicious burgers' } });
  const catSandwiches = await prisma.menuCategory.create({ data: { name: 'Sandwiches', description: 'Grilled and fresh sandwiches' } });
  const catMaggi = await prisma.menuCategory.create({ data: { name: 'Maggi', description: 'Everyone\'s favorite noodles' } });
  const catWraps = await prisma.menuCategory.create({ data: { name: 'Wraps', description: 'Tasty wraps' } });
  const catFries = await prisma.menuCategory.create({ data: { name: 'Fries & Snacks', description: 'Crispy fries and snacks' } });
  const catStarters = await prisma.menuCategory.create({ data: { name: 'Starters', description: 'Perfect to start your meal' } });
  const catMomos = await prisma.menuCategory.create({ data: { name: 'Momos', description: 'Steam and fried momos' } });
  const catOthers = await prisma.menuCategory.create({ data: { name: 'Others', description: 'Other items' } });
  console.log('  Categories created');

  const menuItems = [
    // Beverages
    { categoryId: catBeverages.id, name: 'Masala/Ginger Tea (150 ml)', price: 20 },
    { categoryId: catBeverages.id, name: 'Kulhad Tea (150 ml)', price: 30 },
    { categoryId: catBeverages.id, name: 'Hot Coffee (150 ml)', price: 30 },
    { categoryId: catBeverages.id, name: 'Black Hot Coffee (300 ml)', price: 50 },
    { categoryId: catBeverages.id, name: 'Cold Coffee (300 ml)', price: 60 },
    { categoryId: catBeverages.id, name: 'Cold Coffee with Ice Cream (300 ml)', price: 80 },
    { categoryId: catBeverages.id, name: 'Hot Chocolate (300 ml)', price: 70 },
    { categoryId: catBeverages.id, name: 'Cold Chocolate (300 ml)', price: 60 },
    { categoryId: catBeverages.id, name: 'Hot Bournvita (300 ml)', price: 70 },
    { categoryId: catBeverages.id, name: 'Cold Bournvita (300 ml)', price: 60 },
    { categoryId: catBeverages.id, name: 'Plain Milk (300 ml)', price: 30 },
    // Shakes & Juices
    { categoryId: catShakes.id, name: 'Banana Shake (300 ml)', price: 50 },
    { categoryId: catShakes.id, name: 'Oreo Shake (300 ml)', price: 70 },
    { categoryId: catShakes.id, name: 'Mosambi Juice (300 ml)', price: 60 },
    { categoryId: catShakes.id, name: 'Mosambi + Pineapple (300 ml)', price: 70 },
    { categoryId: catShakes.id, name: 'Kit-Kat Shake (300 ml)', price: 70 },
    { categoryId: catShakes.id, name: 'Peanut Butter Shake (300 ml)', price: 99 },
    { categoryId: catShakes.id, name: 'Mango Shake (300 ml) (Seasonal)', price: 70 },
    { categoryId: catShakes.id, name: 'Brownie Shake (300 ml)', price: 80 },
    // Burgers
    { categoryId: catBurgers.id, name: 'Aloo Tikki Burger (ATBC)', price: 65 },
    { categoryId: catBurgers.id, name: 'Paneer Burger', price: 75 },
    { categoryId: catBurgers.id, name: 'Veg Burger', price: 70 },
    { categoryId: catBurgers.id, name: 'Aloo Tikki Schezwan Burger', price: 70 },
    { categoryId: catBurgers.id, name: 'Crispy Paneer Burger', price: 99 },
    // Sandwiches
    { categoryId: catSandwiches.id, name: 'Aloo Tikki Sandwich', price: 70 },
    { categoryId: catSandwiches.id, name: 'Paneer Sandwich', price: 75 },
    { categoryId: catSandwiches.id, name: 'Veg Sandwich', price: 65 },
    { categoryId: catSandwiches.id, name: 'Aloo Tikki Paneer Sandwich', price: 90 },
    // Maggi
    { categoryId: catMaggi.id, name: 'Plain / Masala Maggi', price: 40 },
    { categoryId: catMaggi.id, name: 'Veg Maggi', price: 50 },
    { categoryId: catMaggi.id, name: 'Cheese Maggi', price: 50 },
    { categoryId: catMaggi.id, name: 'Makhni Masala Maggi', price: 60 },
    { categoryId: catMaggi.id, name: 'Chatpati Achari Maggi', price: 60 },
    { categoryId: catMaggi.id, name: 'Cheese Butter Maggi', price: 70 },
    // Wraps
    { categoryId: catWraps.id, name: 'Chilli Garlic Wrap', price: 80 },
    { categoryId: catWraps.id, name: 'Veg Cheese Wrap', price: 90 },
    { categoryId: catWraps.id, name: 'Crispy Paneer Wrap', price: 99 },
    // Fries & Snacks
    { categoryId: catFries.id, name: 'Crinkle Fries', price: 90 },
    { categoryId: catFries.id, name: 'French Fries', price: 80 },
    { categoryId: catFries.id, name: 'Peri Peri Fries', price: 90 },
    { categoryId: catFries.id, name: 'Cheese Fries', price: 99 },
    // Starters
    { categoryId: catStarters.id, name: 'Spring Roll (5 pcs)', price: 80 },
    { categoryId: catStarters.id, name: 'Veggie Fingers (6 pcs)', price: 80 },
    { categoryId: catStarters.id, name: 'Smiley Fries (6 pcs)', price: 80 },
    { categoryId: catStarters.id, name: 'Chilli Garlic Potatoes (15 pcs)', price: 80 },
    { categoryId: catStarters.id, name: 'Pizza Pockets (5 pcs)', price: 90 },
    { categoryId: catStarters.id, name: 'Cheese Nuggets (8 pcs)', price: 90 },
    // Momos
    { categoryId: catMomos.id, name: 'Veg Fried Momo (8 pcs)', price: 80 },
    { categoryId: catMomos.id, name: 'Cheese Corn Momo (8 pcs)', price: 90 },
    { categoryId: catMomos.id, name: 'Veg Kurkure Momo', price: 99 },
    { categoryId: catMomos.id, name: 'Paneer Momo (8 pcs)', price: 99 },
    // Others
    { categoryId: catOthers.id, name: 'Onion Rings (8 pcs)', price: 99 },
    { categoryId: catOthers.id, name: 'Extra Dip Charges', price: 10 },
  ];

  const items: any[] = [];
  for (const itemData of menuItems) {
    const item = await prisma.menuItem.create({
      data: {
        ...itemData,
        description: `Freshly prepared ${itemData.name}`,
        isAvailable: true,
        inventoryItem: { create: { stockCount: 100, lowStockThreshold: 10 } },
      },
    });
    items.push(item);
  }
  console.log(`  ${items.length} Menu Items created with inventory`);

  // Create some sample orders
  const order1 = await prisma.order.create({
    data: {
      customerId: customer1.id,
      status: 'PICKED_UP',
      totalAmount: items[0].price + items[1].price,
      items: {
        create: [
          { menuItemId: items[0].id, quantity: 1, priceAtTime: items[0].price },
          { menuItemId: items[1].id, quantity: 1, priceAtTime: items[1].price },
        ],
      },
    },
  });

  const order2 = await prisma.order.create({
    data: {
      customerId: customer2.id,
      status: 'READY',
      totalAmount: items[2].price * 2,
      items: {
        create: [
          { menuItemId: items[2].id, quantity: 2, priceAtTime: items[2].price },
        ],
      },
    },
  });

  console.log('  Orders created');

  // Create sample reviews
  await prisma.review.create({
    data: {
      customerId: customer1.id,
      menuItemId: items[0].id,
      orderId: order1.id,
      rating: 5,
      comment: 'Excellent tea!',
    },
  });

  console.log('\nSeed complete! Demo credentials:');
  console.log('   Shopkeeper: shopkeeper@chaiadda.com / password123');
  console.log('   Customer 1: test@customer.com / password123');
  console.log('   Customer 2: anant@college.edu / password123\n');
}

main()
  .catch((e) => {
    console.error('Seed failed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
