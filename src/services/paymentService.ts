import { IPayment } from "../interfaces/IPayment";
import PaymentRepository from "../repositories/paymentRepository";
import { IPaymentService } from "../interfaces/IServices";
import CourseRepository from "../repositories/courseRepository";
import { privateDecrypt } from "crypto";
import stripe from "../utils/stripe";
import { ObjectId } from 'mongodb';



export class PaymentService implements IPaymentService {
    constructor (
        private _paymentRepository: PaymentRepository,
        private _courseRepository: CourseRepository
    ){
        this._paymentRepository = _paymentRepository;
        this._courseRepository =_courseRepository;
    }


    // async createCheckoutSession(courseId: string, userId: string): Promise<string> {
    //     try {
    //       const course = await this._courseRepository.findStudentCourseById(courseId);
    //       if (!course) {
    //         throw new Error('Course not found');
    //       }
    
    //       if (!course.isPublished || course.isBlocked) {
    //         throw new Error('Course is not available');
    //       }
    
    //       const session = await stripe.checkout.sessions.create({
    //         payment_method_types: ['card'],
    //         line_items: [
    //           {
    //             price_data: {
    //               currency: 'inr',
    //               product_data: {
    //                 name: course.title,
    //                 description: `Enrollment in ${course.title}`,
    //               },
    //               unit_amount: course.price * 100, // Convert to paise for Stripe
    //             },
    //             quantity: 1,
    //           },
    //         ],
    //         mode: 'payment',
    //         success_url: `http://localhost:5173/enrollment-success?session_id={CHECKOUT_SESSION_ID}&course_id=${courseId}`,
    //         cancel_url: `http://localhost:5173/enrollment-cancel?course_id=${courseId}`,
    //         metadata: {
    //           courseId: courseId.toString(),
    //           userId: userId.toString(),
    //         },
    //       });
    
    //       const paymentData = {
    //         userId: new ObjectId(userId),
    //         courseId: new ObjectId(courseId),
    //         amount: course.price,
    //         status: 'pending' as 'pending', // or as const
    //         // type: 'credit' as 'credit', // or as const
    //         stripeSessionId: session.id,
    //       };
    
    //       await this._paymentRepository.create(paymentData);
    
    //       return session.id;
    //     } catch (error: any) {
    //       console.error('Error in PaymentService.createCheckoutSession:', error);
    //       throw new Error(error.message || 'Failed to create checkout session');
    //     }
    //   }
    
    //   async verifyPayment(sessionId: string): Promise<{ userId: string; courseId: string }> {
    //     try {
    //       const session = await stripe.checkout.sessions.retrieve(sessionId);
    //       if (session.payment_status !== 'paid') {
    //         await this._paymentRepository.updateStatus(sessionId, 'failed');
    //         throw new Error('Payment not completed');
    //       }
    
    //       const payment = await this._paymentRepository.findBySessionId(sessionId);
    //       if (!payment) {
    //         throw new Error('Payment record not found');
    //       }
    
    //       await this._paymentRepository.updateStatus(sessionId, 'completed');
    
    //       return {
    //         userId: session.metadata?.userId || '',
    //         courseId: session.metadata?.courseId || '',
    //       };
    //     } catch (error: any) {
    //       console.error('Error in PaymentService.verifyPayment:', error);
    //       await this._paymentRepository.updateStatus(sessionId, 'failed');
    //       throw new Error(error.message || 'Failed to verify payment');
    //     }
    //   }

    async createCheckoutSession(courseId: string, userId: string): Promise<string> {
        try {
          const course = await this._courseRepository.findStudentCourseById(courseId);
          if (!course) throw new Error('Course not found');
          if (!course.isPublished || course.isBlocked) throw new Error('Course is not available');
          if (typeof course.price !== 'number' || isNaN(course.price)) throw new Error('Invalid course price');
    
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
              {
                price_data: {
                  currency: 'inr',
                  product_data: { name: course.title, description: `Enrollment in ${course.title}` },
                  unit_amount: Math.round(course.price * 100),
                },
                quantity: 1,
              },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/enrollment-success?session_id={CHECKOUT_SESSION_ID}&course_id=${courseId}`,
            cancel_url: `${process.env.FRONTEND_URL}/enrollment-cancel?course_id=${courseId}`,
            metadata: { courseId, userId },
            billing_address_collection: 'auto', // Minimize extra prompts
          });
    
          await this._paymentRepository.create({
            userId: new ObjectId(userId),
            courseId: new ObjectId(courseId),
            amount: course.price,
            status: 'pending',
            stripeSessionId: session.id,
          });
    
          return session.id;
        } catch (error: any) {
          console.error('Error in PaymentService.createCheckoutSession:', { error: error.message, courseId, userId });
          throw new Error(error.message || 'Failed to create checkout session');
        }
      }
    
      async verifyPayment(sessionId: string): Promise<{ userId: string; courseId: string }> {
        try {
          const session = await stripe.checkout.sessions.retrieve(sessionId);
          if (session.payment_status !== 'paid') {
            await this._paymentRepository.updateStatus(sessionId, 'failed');
            throw new Error('Payment not completed');
          }
    
          const payment = await this._paymentRepository.findBySessionId(sessionId);
          if (!payment) throw new Error('Payment record not found');
    
          const userId = session.metadata?.userId;
          const courseId = session.metadata?.courseId;
          if (!userId || !courseId) throw new Error('Missing userId or courseId in session metadata');
    
          await this._paymentRepository.updateStatus(sessionId, 'completed');
          return { userId, courseId };
        } catch (error: any) {
          console.error('Error in PaymentService.verifyPayment:', { error: error.message, sessionId });
          await this._paymentRepository.updateStatus(sessionId, 'failed');
          throw new Error(error.message || 'Failed to verify payment');
        }
      }

      async getPaymentHistory(userId: string) {
        try {
          const payments = await this._paymentRepository.findByUserId(userId);
          return {
            success: true,
            message: 'Payment history fetched successfully',
            data: payments,
          };
        } catch (error: any) {
          console.error('Error in PaymentService.getPaymentHistory:', error);
          return {
            success: false,
            message: error.message || 'Failed to fetch payment history',
            data: [],
          };
        }
      }
}