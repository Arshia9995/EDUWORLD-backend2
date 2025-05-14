import { Request, Response } from "express";
import { Status } from "../utils/enums";
import { ReviewService } from "../services/reviewService";
import { AuthRequest } from "../middleware/authMiddleware";

class ReviewController {
  constructor(private _reviewService: ReviewService) {
    this._reviewService = _reviewService;
  }

  async addReview(req: AuthRequest, res: Response) {
    try {
      const { courseId, rating, reviewText } = req.body;
      const studentId = req.user?.id; 

      if (!studentId) {
        return res.status(Status.UN_AUTHORISED).json({
          message: "Authentication required"
        });
      }

      const result = await this._reviewService.addReview(courseId, studentId, rating, reviewText);

      if (!result.success) {
        return res.status(Status.BAD_REQUEST).json({ message: result.message });
      }

      return res.status(Status.CREATED).json({
        message: result.message,
        review: result.data
      });
    } catch (error: any) {
      console.error("Error in addReview controller:", error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error"
      });
    }
  }

  async getReviewsByCourse(req: AuthRequest, res: Response) {
    try {
      const { courseId } = req.params;
      const result = await this._reviewService.getReviewsByCourse(courseId);

      if (!result.success) {
        return res.status(Status.NOT_FOUND).json({ message: result.message });
      }

      return res.status(Status.OK).json({
        message: result.message,
        reviews: result.data
      });
    } catch (error: any) {
      console.error("Error in getReviewsByCourse controller:", error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error"
      });
    }
  }

  async updateReview(req: AuthRequest, res: Response) {
    try {
      const { reviewId } = req.params;
      const { rating, reviewText } = req.body;
      const studentId = req.user?.id; 

      if (!studentId) {
        return res.status(Status.UN_AUTHORISED).json({
          message: "Authentication required"
        });
      }

      const result = await this._reviewService.updateReview(reviewId, studentId, rating, reviewText);

      if (!result.success) {
        return res.status(Status.BAD_REQUEST).json({ message: result.message });
      }

      return res.status(Status.OK).json({
        message: result.message,
        review: result.data
      });
    } catch (error: any) {
      console.error("Error in updateReview controller:", error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error"
      });
    }
  }

  async deleteReview(req: AuthRequest, res: Response) {
    try {
      const { reviewId } = req.params;
      const studentId = req.user?.id; 

      if (!studentId) {
        return res.status(Status.UN_AUTHORISED).json({
          message: "Authentication required"
        });
      }

      const result = await this._reviewService.deleteReview(reviewId, studentId);

      if (!result.success) {
        return res.status(Status.BAD_REQUEST).json({ message: result.message });
      }

      return res.status(Status.OK).json({
        message: result.message
      });
    } catch (error: any) {
      console.error("Error in deleteReview controller:", error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        message: "Internal server error"
      });
    }
  }
}

export default ReviewController;