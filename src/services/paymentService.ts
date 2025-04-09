import { IPayment } from "../interfaces/IPayment";
import PaymentRepository from "../repositories/paymentRepository";
import { IPaymentService } from "../interfaces/IServices";
import CourseRepository from "../repositories/courseRepository";
import stripe from "../utils/stripe";
import { ObjectId } from 'mongodb';

export class PaymentService implements IPaymentService {
  constructor(
    private readonly _paymentRepository: PaymentRepository,
    private readonly _courseRepository: CourseRepository
  ) {}

  async createCheckoutSession(courseId: string, userId: string): Promise<string> {
    try {
      const course = await this._courseRepository.findStudentCourseById(courseId);
      if (!course) {
        throw new Error('Course not found');
      }

      if (!course.isPublished || course.isBlocked) {
        throw new Error('Course is not available');
      }

      const session = await stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: [
          {
            price_data: {
              currency: 'inr',
              product_data: {
                name: course.title,
                description: `Enrollment in ${course.title}`,
              },
              unit_amount: Math.round(course.price * 100), // Convert to paise
            },
            quantity: 1,
          },
        ],
        mode: 'payment',
        success_url: `${process.env.FRONTEND_URL}/enrollment-success?session_id={CHECKOUT_SESSION_ID}&course_id=${courseId}`,
        cancel_url: `${process.env.FRONTEND_URL}/enrollment-cancel?course_id=${courseId}`,
        metadata: {
          courseId: courseId,
          userId: userId,
        },
      });

      const paymentData: Partial<IPayment> = {
        userId: new ObjectId(userId),
        courseId: new ObjectId(courseId),
        amount: course.price,
        status: 'pending',
        stripeSessionId: session.id,
      };

      await this._paymentRepository.create(paymentData);

      return session.id;
    } catch (error: any) {
      console.error('Error in PaymentService.createCheckoutSession:', error);
      throw new Error(error.message || 'Failed to create checkout session');
    }
  }

  async verifyPayment(sessionId: string): Promise<{ userId: string; courseId: string }> {
    try {
      console.log('Retrieving Stripe session with sessionId:', sessionId);
      const session = await stripe.checkout.sessions.retrieve(sessionId);
      if (session.payment_status !== 'paid') {
        await this._paymentRepository.updateStatus(sessionId, 'failed');
        throw new Error('Payment not completed');
      }
  
      console.log('Stripe session metadata:', session.metadata);
      const payment = await this._paymentRepository.findBySessionId(sessionId);
      if (!payment) {
        throw new Error('Payment record not found');
      }
  
      await this._paymentRepository.updateStatus(sessionId, 'completed');
      return {
        userId: session.metadata?.userId || '',
        courseId: session.metadata?.courseId || '',
      };
    } catch (error: any) {
      console.error('Error in PaymentService.verifyPayment:', error);
      await this._paymentRepository.updateStatus(sessionId, 'failed');
      throw new Error(error.message || 'Failed to verify payment');
    }
  }
}