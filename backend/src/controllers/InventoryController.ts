import { Request, Response } from 'express';
import InventoryService from '../services/InventoryService';
import { updateInventorySchema } from '../validators/menuValidator';
import { ValidationError } from '../utils/errors';
import { liveInventoryUpdater } from '../patterns/OrderObserver';

class InventoryController {
  /**
   * GET /inventory
   * Fetches all inventory counts + thresholds.
   * Guarded by requireShopkeeper.
   */
  async getAllStock(req: Request, res: Response) {
    const list = await InventoryService.getAllInventory();
    res.status(200).json({ success: true, inventory: list });
  }

  /**
   * PATCH /inventory/:menuItemId
   * Updates stock counts, triggering alerts via Observer if thresholds met.
   * Guarded by requireShopkeeper.
   */
  async updateStock(req: Request, res: Response) {
    const parsed = updateInventorySchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError('Invalid inventory data');

    const result = await InventoryService.updateStock(
      req.params.menuItemId as string,
      parsed.data.stockCount,
      parsed.data.lowStockThreshold
    );

    res.status(200).json({ success: true, inventory: result });
  }

  /**
   * GET /inventory/stream
   * Connects public clients to the live inventory stream.
   */
  async streamLiveInventory(req: Request, res: Response) {
    res.setHeader('Content-Type', 'text/event-stream');
    res.setHeader('Cache-Control', 'no-cache');
    res.setHeader('Connection', 'keep-alive');

    // Send initial connected payload
    res.write(`data: ${JSON.stringify({ message: 'connected' })}\n\n`);

    // Add this response object to the public SSE clients array
    liveInventoryUpdater.addClient(res);
  }
}

export default new InventoryController();
