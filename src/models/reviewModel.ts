import mongoose, { Schema } from "mongoose";
import { IReview } from "../interfaces/IReview";


const ReviewSchema = new Schema<IReview>(
  {
    courseId: {
      type: Schema.Types.ObjectId,
      ref: "courses",
      required: true,
    },
    studentId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    rating: {
      type: Number,
      required: true,
      min: 1,
      max: 5,
    },
    reviewText: {
      type: String,
      required: true,
    },
  },
  {
    timestamps: true,
  }
);

export const reviewModel = mongoose.model<IReview>("reviews", ReviewSchema);