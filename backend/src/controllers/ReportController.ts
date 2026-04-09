import { Request, Response } from 'express';
import { ReportContext, SalesReportStrategy, InventoryReportStrategy } from '../patterns/ReportStrategy';
import { ValidationError } from '../utils/errors';

class ReportController {
  
  async getReport(req: Request, res: Response) {
    try {
      const type = String(req.query.type || "").trim().toLowerCase();
      let strategy;
      
      switch (type) {
        case 'sales':
          strategy = new SalesReportStrategy();
          break;
        case 'inventory':
          strategy = new InventoryReportStrategy();
          break;
        default:
          return res.status(400).json({ success: false, error: 'Invalid report type. Supported: sales, inventory' });
      }

      const context = new ReportContext(strategy);
      const reportData = await context.executeStrategy();

      res.status(200).json({ success: true, report: reportData });
    } catch (error: any) {
      console.error(error);
      res.status(500).json({ success: false, error: error.message || 'Internal processing error' });
    }
  }

}

export default new ReportController();
