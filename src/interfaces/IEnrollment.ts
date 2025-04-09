import { Document, Types } from 'mongoose';


export interface IEnrollment extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  enrolledAt: Date;
  completionStatus: 'enrolled' | 'in-progress' | 'completed';
  createdAt?: Date;  
  updatedAt?: Date;  
}