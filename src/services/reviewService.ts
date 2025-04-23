import { IReview } from "../interfaces/IReview";
import ReviewRepository from "../repositories/reviewRepository";
import mongoose from "mongoose";
import { IReviewService } from "../interfaces/IServices";



export class ReviewService implements IReviewService {
  constructor(private _reviewRepository: ReviewRepository) {
    this._reviewRepository = _reviewRepository;
  }

  async addReview(courseId: string, studentId: string, rating: number, reviewText: string) {
    try {
      // Validate input
      if (!courseId || !studentId || !rating || !reviewText.trim()) {
        return { success: false, message: "Missing required fields", data: null };
      }

      if (rating < 1 || rating > 5) {
        return { success: false, message: "Rating must be between 1 and 5", data: null };
      }

      // Check if user already reviewed this course
      const existingReview = await this._reviewRepository.findByUserAndCourse(studentId, courseId);
      if (existingReview) {
        return { success: false, message: "You have already reviewed this course", data: null };
      }

      // Create the review
      const review = await this._reviewRepository.create({
        courseId: new mongoose.Types.ObjectId(courseId),
        studentId: new mongoose.Types.ObjectId(studentId),
        rating,
        reviewText
      });

      return {
        success: true,
        message: "Review added successfully",
        data: review
      };
    } catch (error) {
      console.error("Error adding review:", error);
      return { success: false, message: "Internal server error", data: null };
    }
  }

  async getReviewsByCourse(courseId: string) {
    try {
      if (!courseId) {
        return { success: false, message: "Course ID is required", data: null };
      }

      const reviews = await this._reviewRepository.findAllByCourse(courseId);
      if (reviews.length === 0) {
        return { success: false, message: "No reviews found for this course", data: [] };
      }

      return {
        success: true,
        message: "Reviews retrieved successfully",
        data: reviews
      };
    } catch (error) {
      console.error("Error fetching course reviews:", error);
      return { success: false, message: "Internal server error", data: null };
    }
  }

  async updateReview(reviewId: string, studentId: string, rating: number, reviewText: string) {
    try {
      // Validate input
      if (!reviewId || !studentId || !rating || !reviewText.trim()) {
        return { success: false, message: "Missing required fields", data: null };
      }

      if (rating < 1 || rating > 5) {
        return { success: false, message: "Rating must be between 1 and 5", data: null };
      }

      // Find the review
      const review = await this._reviewRepository.findById(reviewId);
      if (!review) {
        return { success: false, message: "Review not found", data: null };
      }

      // Check if the review belongs to the student
      if (review.studentId.toString() !== studentId) {
        return { success: false, message: "You can only update your own reviews", data: null };
      }

      // Update the review
      const updatedReview = await this._reviewRepository.update(reviewId, { rating, reviewText });

      return {
        success: true,
        message: "Review updated successfully",
        data: updatedReview
      };
    } catch (error) {
      console.error("Error updating review:", error);
      return { success: false, message: "Internal server error", data: null };
    }
  }

  async deleteReview(reviewId: string, studentId: string) {
    try {
      if (!reviewId || !studentId) {
        return { success: false, message: "Missing required fields", data: null };
      }

      // Find the review
      const review = await this._reviewRepository.findById(reviewId);
      if (!review) {
        return { success: false, message: "Review not found", data: null };
      }

      // Check if the review belongs to the student
      if (review.studentId.toString() !== studentId) {
        return { success: false, message: "You can only delete your own reviews", data: null };
      }

      // Delete the review
      const result = await this._reviewRepository.delete(reviewId);
      if (!result) {
        return { success: false, message: "Failed to delete review", data: null };
      }

      return {
        success: true,
        message: "Review deleted successfully",
        data: null
      };
    } catch (error) {
      console.error("Error deleting review:", error);
      return { success: false, message: "Internal server error", data: null };
    }
  }
}