import mongoose, { model, Schema } from "mongoose";
import { ICourse } from "../interfaces/ICourse";


const courseSchema = new Schema(
  {
    title: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    thumbnail: {
      type: String,
    //   required: true,
    },
    instructor: {
      type: mongoose.Types.ObjectId,
      ref: "User",
    //   required: true,
    },
    category: {
      type: mongoose.Types.ObjectId,
      ref: "Category",
      required: true,
    },
    price: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      default: "english",
    },
    duration: {
      type: String,
      required: false,
    },
    isPublished: {
      type: Boolean,
      default: false,
    },
    lessons: [
        {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'lessons',
            default:[]
        }
    ],
    rating: {
      type: Number,
    },
    isBlocked: {
      type: Boolean,
      default: false,
    },
  },
  { timestamps: true }
);

export const courseModel = model<ICourse>("courses", courseSchema);