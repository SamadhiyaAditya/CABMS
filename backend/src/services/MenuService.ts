/**
 * MenuService — Manages Categories and Items.
 * Demonstrates bringing the Composite pattern (MenuCategoryComposite) to life 
 * by feeding Database data heavily into the hierarchy objects.
 */
import DatabaseConnection from '../config/DatabaseConnection';
import { NotFoundError } from '../utils/errors';
import { MenuCategoryComposite, MenuItemLeaf } from '../patterns/MenuComposite';
import InventoryService from './InventoryService';

class MenuService {
  private prisma = DatabaseConnection.getInstance();

  /**
   * Fetches the entire menu as a constructed Composite pattern tree.
   * This provides incredibly clean JSON mapping for the Next.js frontend!
   */
  async getFullMenuTree() {
    const categories = await this.prisma.menuCategory.findMany({
      include: {
        items: {
          include: { inventoryItem: true }
        }
      }
    });

    // We utilize our Composite classes to construct the tree logically.
    const rootMenu = categories.map((cat: any) => {
      const categoryComposite = new MenuCategoryComposite(cat.id, cat.name, cat.description);
      
      for (const item of cat.items) {
        // Convert Prisma model to Composite Leaf
        const leaf = new MenuItemLeaf(
          item.id, 
          item.name, 
          Number(item.price), 
          item.description, 
          item.inventoryItem?.stockCount || 0
        );
        categoryComposite.add(leaf);
      }
      
      return {
        id: categoryComposite.getId(),
        name: categoryComposite.getName(),
        description: cat.description,
        isAvailable: categoryComposite.isAvailable(),
        items: cat.items.map((i: any) => ({
          id: i.id,
          name: i.name,
          description: i.description,
          price: Number(i.price),
          imageUrl: i.imageUrl,
          isAvailable: i.isAvailable && (i.inventoryItem?.stockCount || 0) > 0,
          stockCount: i.inventoryItem?.stockCount || 0
        }))
      };
    });

    return rootMenu;
  }

  async getCategories() {
    return await this.prisma.menuCategory.findMany();
  }

  async createCategory(data: { name: string; description?: string }) {
    return await this.prisma.menuCategory.create({ data });
  }

  async createMenuItem(data: { 
    categoryId: string; 
    name: string; 
    description?: string; 
    price: number; 
    imageUrl?: string; 
    initialStock: number 
  }) {
    // We use a Transaction to ensure the Item AND Inventory are made atomically simultaneously.
    return await this.prisma.$transaction(async (tx) => {
      const item = await (tx as any).menuItem.create({
        data: {
          categoryId: data.categoryId,
          name: data.name,
          description: data.description,
          price: data.price,
          imageUrl: data.imageUrl,
          // If initial stock is 0, auto-set to false.
          isAvailable: data.initialStock > 0 
        }
      });

      const inventory = await (tx as any).inventoryItem.create({
        data: {
          menuItemId: item.id,
          stockCount: data.initialStock,
          lowStockThreshold: 5 // Default warning point
        }
      });

      return { item, inventory };
    });
  }

  async updateMenuItem(id: string, data: any) {
    return await this.prisma.menuItem.update({
      where: { id },
      data,
    });
  }

  async deleteMenuItem(id: string) {
    return await this.prisma.menuItem.delete({
      where: { id }
    });
  }
}

export default new MenuService();
