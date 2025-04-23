import { IPayment } from "../interfaces/IPayment";
import PaymentRepository from "../repositories/paymentRepository";
import { IPaymentService } from "../interfaces/IServices";
import CourseRepository from "../repositories/courseRepository";
import { privateDecrypt } from "crypto";
import stripe from "../utils/stripe";
import { ObjectId } from 'mongodb';
import { WalletService } from "./walletService";



export class PaymentService implements IPaymentService {
    constructor (
        private _paymentRepository: PaymentRepository,
        private _courseRepository: CourseRepository,
        private _walletService: WalletService
        
    ){
        this._paymentRepository = _paymentRepository;
        this._courseRepository =_courseRepository;
        this._walletService = _walletService;
    }



    // async createCheckoutSession(courseId: string, userId: string): Promise<string> {
    //     try {
    //       const course = await this._courseRepository.findStudentCourseById(courseId);
    //       if (!course) throw new Error('Course not found');
    //       if (!course.isPublished || course.isBlocked) throw new Error('Course is not available');
    //       if (typeof course.price !== 'number' || isNaN(course.price)) throw new Error('Invalid course price');
    
    //       const session = await stripe.checkout.sessions.create({
    //         payment_method_types: ['card'],
    //         line_items: [
    //           {
    //             price_data: {
    //               currency: 'inr',
    //               product_data: { name: course.title, description: `Enrollment in ${course.title}` },
    //               unit_amount: Math.round(course.price * 100),
    //             },
    //             quantity: 1,
    //           },
    //         ],
    //         mode: 'payment',
    //         success_url: `${process.env.FRONTEND_URL}/enrollment-success?session_id={CHECKOUT_SESSION_ID}&course_id=${courseId}`,
    //         cancel_url: `${process.env.FRONTEND_URL}/enrollment-cancel?course_id=${courseId}`,
    //         metadata: { courseId, userId },
    //         billing_address_collection: 'auto', // Minimize extra prompts
    //       });
    
    //       await this._paymentRepository.create({
    //         userId: new ObjectId(userId),
    //         courseId: new ObjectId(courseId),
    //         amount: course.price,
    //         status: 'pending',
    //         stripeSessionId: session.id,
    //       });
    
    //       return session.id;
    //     } catch (error: any) {
    //       console.error('Error in PaymentService.createCheckoutSession:', { error: error.message, courseId, userId });
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
    //       if (!payment) throw new Error('Payment record not found');
    
    //       const userId = session.metadata?.userId;
    //       const courseId = session.metadata?.courseId;
    //       if (!userId || !courseId) throw new Error('Missing userId or courseId in session metadata');
    
    //       await this._paymentRepository.updateStatus(sessionId, 'completed');
    //       return { userId, courseId };
    //     } catch (error: any) {
    //       console.error('Error in PaymentService.verifyPayment:', { error: error.message, sessionId });
    //       await this._paymentRepository.updateStatus(sessionId, 'failed');
    //       throw new Error(error.message || 'Failed to verify payment');
    //     }
    //   }

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

    async createCheckoutSession(courseId: string, userId: string): Promise<string> {
        try {
          const course = await this._courseRepository.findStudentCourseById(courseId);
          if (!course) throw new Error('Course not found');
          if (!course.isPublished || course.isBlocked) throw new Error('Course is not available');
          if (typeof course.price !== 'number' || isNaN(course.price)) throw new Error('Invalid course price');
          if (!course.instructor?._id) throw new Error('Instructor not found for the course');
    
          const instructorShare = course.price * 0.6; // 60% for instructor
    
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
            metadata: { courseId, userId, instructorId: course.instructor._id.toString() },
            billing_address_collection: 'auto',
          });
    
          await this._paymentRepository.create({
            userId: new ObjectId(userId),
            courseId: new ObjectId(courseId),
            instructorId: new ObjectId(course.instructor._id),
            amount: course.price,
            status: 'pending',
            stripeSessionId: session.id,
            instructorShare,
          });
    
          return session.id;
        } catch (error: any) {
          console.error('Error in PaymentService.createCheckoutSession:', { error: error.message, courseId, userId });
          throw new Error(error.message || 'Failed to create checkout session');
        }
      }
    
      async verifyPayment(sessionId: string): Promise<{ userId: string; courseId: string; instructorId?: string }> {
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
          const instructorId = session.metadata?.instructorId;
          if (!userId || !courseId || !instructorId) throw new Error('Missing userId, courseId, or instructorId in session metadata');
    
          // Update payment status
          await this._paymentRepository.updateStatus(sessionId, 'completed');
    
          // Credit instructor's wallet
          if (payment.instructorShare && payment.instructorId) {


            const course = await this._courseRepository.findById(courseId);
            const courseTitle = course ? course.title : `Course ID: ${courseId}`;

            await this._walletService.creditInstructorWallet(
              payment.instructorId.toString(),
              payment.instructorShare,
              `Payment for course: ${ courseTitle}`,
              courseId
            );
          }
    
          return { userId, courseId, instructorId };
        } catch (error: any) {
          console.error('Error in PaymentService.verifyPayment:', { error: error.message, sessionId });
          await this._paymentRepository.updateStatus(sessionId, 'failed');
          throw new Error(error.message || 'Failed to verify payment');
        }
      }
}