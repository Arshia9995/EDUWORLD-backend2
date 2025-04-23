import { Document, Types } from 'mongoose';


export interface IPayment extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  instructorId: Types.ObjectId; // Add instructor ID
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type?: 'credit' | 'debit';
  amount: number;
  stripeSessionId: string;
  instructorShare?: number; // Optional field to store instructor's share
  createdAt?: Date;  
  updatedAt?: Date;  
}