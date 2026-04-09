import DatabaseConnection from '../config/DatabaseConnection';

class ReviewService {
  private prisma = DatabaseConnection.getInstance();

  async addReview(customerId: string, menuItemId: string, rating: number, comment?: string) {
    return await this.prisma.review.create({
      data: {
        rating,
        comment,
        customerId,
        menuItemId
      }
    });
  }

  async getReviewsForMenu(menuItemId: string) {
    return await this.prisma.review.findMany({
      where: { menuItemId },
      include: {
        customer: { select: { name: true } }
      },
      orderBy: { createdAt: 'desc' }
    });
  }
}

export default new ReviewService();
