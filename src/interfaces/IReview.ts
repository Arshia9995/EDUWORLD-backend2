import mongoose, { Document } from "mongoose";

export interface IReview extends Document {
  courseId: mongoose.Types.ObjectId;
  studentId: mongoose.Types.ObjectId;
  rating?: number;
  reviewText?: string;
  createdAt?: Date;
  updatedAt?: Date;
}