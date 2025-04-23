import { Document, Types } from 'mongoose';


export interface IWallet extends Document {
    userId: Types.ObjectId;
    balance: number;
    transactions: {
      amount: number;
      type: 'credit' | 'debit';
      description: string;
      courseId?: Types.ObjectId;
      createdAt: Date;
    }[];
  }