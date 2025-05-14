import { Schema, model } from 'mongoose';
import { IPayment } from '../interfaces/IPayment';

const paymentSchema = new Schema(
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
    instructorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true, 
      },
    status: {
      type: String,
      enum: ['pending', 'completed', 'failed', 'refunded'],
      required: true,
    },
    type: {
      type: String,
      enum: ['credit', 'debit'],
      required: false,
    },
    amount: {
      type: Number,
      required: true,
    },
    instructorShare: {
        type: Number,
        required: false, 
      },
      adminShare: { 
        type: Number,
        required: true },
    stripeSessionId: {
      type: String,
      required: true,
    },
  },
  { timestamps: true }
);

export const paymentModel = model<IPayment>('payments', paymentSchema);