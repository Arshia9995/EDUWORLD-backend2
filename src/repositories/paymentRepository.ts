import mongoose from "mongoose";
import { IPayment } from "../interfaces/IPayment";
import { paymentModel } from "../models/paymentModel";
import { BaseRepository } from "./baseRepository";

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
}

export default PaymentRepository;