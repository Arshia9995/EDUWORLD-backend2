import mongoose from "mongoose";
import { IPayment } from "../interfaces/IPayment";
import { paymentModel } from "../models/paymentModel";
import { BaseRepository } from "./baseRepository";


interface UpdatePaymentInput {
  _id: mongoose.Types.ObjectId;
  stripeSessionId: string;
  status: string;
  instructorShare: number;
  adminShare: number;
}

interface PaymentHistoryItem {
  _id: string;
  studentName: string;
  courseTitle: string;
  amount: number;
  paymentDate: Date;
  status: string;
  instructorName: string;
  instructorShare: number;
  adminShare: number;
  type: string;
}

interface PaymentHistoryResult {
  payments: PaymentHistoryItem[];
  total: number;
}

class PaymentRepository extends BaseRepository<IPayment> {
  constructor() {
    super(paymentModel);
  }

  async create(paymentData: Partial<IPayment>): Promise<IPayment> {
    try {
      const payment = await this._model.create(paymentData);
      return payment;
    } catch (error) {
      console.error('Error in PaymentRepository.create:', error);
      throw new Error('Could not create payment');
    }
  }

  async findBySessionId(sessionId: string): Promise<IPayment | null> {
    try {
      const payment = await this._model.findOne({ stripeSessionId: sessionId }).lean();
      return payment;
    } catch (error) {
      console.error('Error in PaymentRepository.findBySessionId:', error);
      throw new Error('Could not fetch payment');
    }
  }

  async updateStatus(sessionId: string, status: 'completed' | 'failed' | 'refunded'): Promise<IPayment | null> {
    try {
      const payment = await this._model
        .findOneAndUpdate(
          { stripeSessionId: sessionId },
          { status },
          { new: true }
        )
        .lean();
      return payment;
    } catch (error) {
      console.error('Error in PaymentRepository.updateStatus:', error);
      throw new Error('Could not update payment status');
    }
  }

  async findByUserId(userId: string): Promise<IPayment[]> {
    try {
      const payments = await this._model
        .find({ userId: new mongoose.Types.ObjectId(userId) })
        .populate({
          path: 'courseId',
          select: 'title',
        })
        .sort({ createdAt: -1 })
        .lean();
      return payments;
    } catch (error) {
      console.error('Error in PaymentRepository.findByUserId:', error);
      throw new Error('Could not fetch payment history');
    }
  }
  async updatee(input: UpdatePaymentInput): Promise<void> {
    try {
      await this._model.updateOne(
        { _id: input._id },
        {
          $set: {
            stripeSessionId: input.stripeSessionId,
            status: input.status,
            instructorShare: input.instructorShare,
            adminShare: input.adminShare,
          },
        }
      );
    } catch (error) {
      console.error('Error in PaymentRepository.update:', error);
      throw new Error('Could not update payment');
    }
  }

  async getAllPaymentHistory(page: number, limit: number): Promise<PaymentHistoryResult> {
    try {
      const skip = (page - 1) * limit;

      const payments = await this._model.aggregate([
        {
          $lookup: {
            from: 'users',
            localField: 'userId',
            foreignField: '_id',
            as: 'student',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'instructorId',
            foreignField: '_id',
            as: 'instructor',
          },
        },
        {
          $lookup: {
            from: 'courses',
            localField: 'courseId',
            foreignField: '_id',
            as: 'course',
          },
        },
        {
          $unwind: '$student',
        },
        {
          $unwind: '$instructor',
        },
        {
          $unwind: '$course',
        },
        {
          $project: {
            _id: '$_id',
            studentName: '$student.name',
            courseTitle: '$course.title',
            amount: '$amount',
            paymentDate: '$createdAt',
            status: '$status',
            instructorName: '$instructor.name',
            instructorShare: '$instructorShare',
            adminShare: '$adminShare',
            type: '$type',
          },
        },
        {
          $sort: { paymentDate: -1 }, // Sort by latest payment first
        },
        {
          $facet: {
            payments: [{ $skip: skip }, { $limit: limit }],
            total: [{ $count: 'count' }],
          },
        },
      ]);

      const total = payments[0].total.length > 0 ? payments[0].total[0].count : 0;

      return {
        payments: payments[0].payments,
        total,
      };
    } catch (error) {
      console.error('Error in PaymentRepository.getAllPaymentHistory:', error);
      throw new Error('Could not fetch payment history');
    }
  }

  
}

export default PaymentRepository;