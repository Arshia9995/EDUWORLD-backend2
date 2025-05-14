import { Document, Types } from 'mongoose';


export interface IPayment extends Document {
  userId: Types.ObjectId;
  courseId: Types.ObjectId;
  instructorId: Types.ObjectId; 
  status: 'pending' | 'completed' | 'failed' | 'refunded';
  type?: 'credit' | 'debit';
  amount: number;
  stripeSessionId: string;
  instructorShare?: number; 
  adminShare: number;
  createdAt?: Date;  
  updatedAt?: Date;  
}