import { Schema, model } from 'mongoose';
import { IWallet } from '../interfaces/IWallet';

const walletSchema = new Schema(
    {
      userId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
        unique: true
      },
      balance: {
        type: Number,
        default: 0
      },
      transactions: [
        {
          amount: {
            type: Number,
            required: true
          },
          type: {
            type: String,
            enum: ['credit', 'debit'],
            required: true
          },
          description: {
            type: String,
            required: true
          },
          courseId: {
            type: Schema.Types.ObjectId,
            ref: 'courses'
          },
          createdAt: {
            type: Date,
            default: Date.now
          }
        }
      ]
    },
    { timestamps: true }
  );
  
  export const walletModel = model<IWallet>('wallets', walletSchema);