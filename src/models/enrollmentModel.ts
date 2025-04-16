import { Schema, model } from 'mongoose';
import { IEnrollment , IProgress} from '../interfaces/IEnrollment';

const enrollmentSchema = new Schema(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    courseId: {
      type: Schema.Types.ObjectId,
      ref: 'courses',
      required: true,
    },
    enrolledAt: {
      type: Schema.Types.Date,
      default: function () {
        return Date.now();
      },
    },
    completionStatus: {
      type: String,
      enum: ['enrolled', 'in-progress', 'completed'],
      default: 'enrolled',
    },
    progress: {
        completedLessons: {
          type: [Schema.Types.ObjectId],
          ref: "lessons",
          default: [],
        },
        overallCompletionPercentage: {
          type: Number,
          default: 0,
          min: 0,
          max: 100,
        },
      },
  },
  { timestamps: true }
);

export const enrollmentModel = model<IEnrollment>('enrollments', enrollmentSchema);