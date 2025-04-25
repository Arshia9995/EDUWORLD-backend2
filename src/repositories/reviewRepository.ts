import { reviewModel } from "../models/reviewModel";
import { BaseRepository } from "./baseRepository";
import { IReview } from "../interfaces/IReview";

class ReviewRepository extends BaseRepository<IReview> {
  constructor() {
    super(reviewModel);
  }

  async findByUserAndCourse(studentId: string, courseId: string): Promise<IReview | null> {
    try {
      return await this._model.findOne({ studentId, courseId });
    } catch (error) {
      console.error("Error finding review by user and course:", error);
      throw new Error("Could not find review by user and course");
    }
  }

  async findAllByCourse(courseId: string): Promise<IReview[]> {
    try {
      return await this._model.find({ courseId })
        .populate('studentId', 'name email profile')
        .sort({ createdAt: -1 });
    } catch (error) {
      console.error("Error finding reviews by course:", error);
      throw new Error("Could not find reviews by course");
    }
  }
}

export default ReviewRepository;