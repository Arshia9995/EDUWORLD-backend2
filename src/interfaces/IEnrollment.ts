import { Document, Types } from 'mongoose';

export interface IProgress {
  completedLessons: Types.ObjectId[];
  overallCompletionPercentage: number;
}

export interface IEnrollment extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  enrolledAt: Date;
  completionStatus: 'enrolled' | 'in-progress' | 'completed';
  progress: IProgress;
  createdAt?: Date;  
  updatedAt?: Date;  
}