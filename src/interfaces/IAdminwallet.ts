import { Document, Types } from 'mongoose';

 export interface IAdminWallet extends Document {
  adminId: Types.ObjectId;
  balance: number;
  transactions: Array<{
    amount: number;
    type: 'credit' | 'debit';
    description: string;
    courseId?: Types.ObjectId;
    createdAt: Date;
  }>;
}