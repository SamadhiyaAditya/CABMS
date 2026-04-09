import { Request, Response } from 'express';
import ReviewService from '../services/ReviewService';
import { reviewSchema } from '../validators/reviewValidator';
import { ValidationError } from '../utils/errors';

class ReviewController {
  
  async addReview(req: Request, res: Response) {
    const customerId = req.user!.userId;
    const { menuItemId } = req.params;

    const parsed = reviewSchema.safeParse(req.body);
    if (!parsed.success) throw new ValidationError(parsed.error.issues.map((e: any) => e.message).join(', '));

    const review = await ReviewService.addReview(customerId, menuItemId as string, parsed.data.rating, parsed.data.comment);
    res.status(201).json({ success: true, message: 'Review successfully submitted', review });
  }

  async getReviews(req: Request, res: Response) {
    const { menuItemId } = req.params;
    const reviews = await ReviewService.getReviewsForMenu(menuItemId as string);
    res.status(200).json({ success: true, reviews });
  }

}

export default new ReviewController();
