import { Schema, model } from 'mongoose';
import { IAdminWallet } from '../interfaces/IAdminwallet';



const AdminWalletSchema = new Schema<IAdminWallet>({
    adminId: {
      type: Schema.Types.ObjectId,
      ref: 'Admin',
      required: true,
      unique: true,
    },
    balance: {
      type: Number,
      default: 0,
      min: 0,
    },
    transactions: [
      {
        amount: {
          type: Number,
          required: true,
        },
        type: {
          type: String,
          enum: ['credit', 'debit'],
          required: true,
        },
        description: {
          type: String,
          required: true,
        },
        courseId: {
          type: Schema.Types.ObjectId,
          ref: 'Course',
        },
        createdAt: {
          type: Date,
          default: Date.now,
        },
      },
    ],
  });
  
  export const adminWalletModel = model<IAdminWallet>('AdminWallet', AdminWalletSchema);