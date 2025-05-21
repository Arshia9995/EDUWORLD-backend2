import { IPayment } from "../interfaces/IPayment";
import PaymentRepository from "../repositories/paymentRepository";
import { IPaymentService } from "../interfaces/IServices";
import CourseRepository from "../repositories/courseRepository";
import { privateDecrypt } from "crypto";
import stripe from "../utils/stripe";
import { ObjectId } from 'mongodb';
import { WalletService } from "./walletService";
import AdminRepository from "../repositories/adminRepository";
import Stripe from "stripe";

interface PaymentHistoryResult {
  payments: {
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
  }[];
  total: number;
}



export class PaymentService implements IPaymentService {
    constructor (
        private _paymentRepository: PaymentRepository,
        private _courseRepository: CourseRepository,
        private _walletService: WalletService,
        private _adminRepository: AdminRepository,
        
    ){
        this._paymentRepository = _paymentRepository;
        this._courseRepository =_courseRepository;
        this._walletService = _walletService;
        this._adminRepository = _adminRepository;
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

    async createCheckoutSession(courseId: string, userId: string): Promise<string> {
        try {
          const course = await this._courseRepository.findStudentCourseById(courseId);
          if (!course) throw new Error('Course not found');
          if (!course.isPublished || course.isBlocked) throw new Error('Course is not available');
          if (typeof course.price !== 'number' || isNaN(course.price)) throw new Error('Invalid course price');
          if (!course.instructor?._id) throw new Error('Instructor not found for the course');
    
          const instructorShare = course.price * 0.6; // 60% for instructor
          const adminShare = course.price * 0.4;
    
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
            success_url: `https://eduworld.space/enrollment-success?session_id={CHECKOUT_SESSION_ID}&course_id=${courseId}`,
            cancel_url: `https://eduworld.space/enrollment-cancel?course_id=${courseId}`,
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
            adminShare,
          });
    
          return session.id;
        } catch (error: any) {
          console.error('Error in PaymentService.createCheckoutSession:', { error: error.message, courseId, userId });
          throw new Error(error.message || 'Failed to create checkout session');
        }
      }

      async retryPayment(paymentId: string, userId: string): Promise<string> {
        try {
          const payment = await this._paymentRepository.findById(paymentId);
          if (!payment) throw new Error('Payment not found');
          if (payment.userId.toString() !== userId) throw new Error('Unauthorized: User does not own this payment');
          if (payment.status !== 'pending') throw new Error('Payment is not in a retryable state');
    
          const course = await this._courseRepository.findStudentCourseById(payment.courseId.toString());
          if (!course) throw new Error('Course not found');
          if (!course.isPublished || course.isBlocked) throw new Error('Course is not available');
          if (typeof course.price !== 'number' || isNaN(course.price)) throw new Error('Invalid course price');
          if (!course.instructor?._id) throw new Error('Instructor not found for the course');
    
          const instructorShare = course.price * 0.6;
          const adminShare = course.price * 0.4;
    
          const session = await stripe.checkout.sessions.create({
            payment_method_types: ['card'],
            line_items: [
              {
                price_data: {
                  currency: 'inr',
                  product_data: { name: course.title, description: `Retry payment for ${course.title}` },
                  unit_amount: Math.round(course.price * 100),
                },
                quantity: 1,
              },
            ],
            mode: 'payment',
            success_url: `${process.env.FRONTEND_URL}/retry-payment-success?session_id={CHECKOUT_SESSION_ID}&course_id=${payment.courseId}`,
            cancel_url: `${process.env.FRONTEND_URL}/payment-history`,
            metadata: { courseId: payment.courseId.toString(), userId, instructorId: course.instructor._id.toString(), originalPaymentId: paymentId },
            billing_address_collection: 'auto',
          });
    
          
          await this._paymentRepository.updatee({
            _id: new ObjectId(paymentId),
            stripeSessionId: session.id,
            status: 'pending',
            instructorShare,
            adminShare,
          });
    
          return session.id;
        } catch (error: any) {
          console.error('Error in PaymentService.retryPayment:', { error: error.message, paymentId, userId });
          throw new Error(error.message || 'Failed to create retry checkout session');
        }
      }


      async handleWebhookEvent(event: Stripe.Event): Promise<void> {
        try {
          switch (event.type) {
            case 'checkout.session.completed': {
              const session = event.data.object as Stripe.Checkout.Session;
      
              if (session.payment_status === 'paid') {
                const metadata = session.metadata;
                if (!metadata?.userId || !metadata?.courseId || !session.id) {
                  throw new Error('Missing required metadata in Stripe session');
                }
      
                const existingPayment = await this._paymentRepository.findBySessionId(session.id);
                if (!existingPayment) {
                  console.warn('Payment not found for session:', session.id);
                  return;
                }
      
                if (existingPayment.status !== 'completed') {
                  await this._paymentRepository.updateStatus(session.id, 'completed');
                }
              }
              break;
            }
      
            case 'checkout.session.expired':
            case 'checkout.session.async_payment_failed': {
              const session = event.data.object as Stripe.Checkout.Session;
      
              if (session.id) {
                await this._paymentRepository.updateStatus(session.id, 'failed');
              }
              break;
            }
      
            default:
              console.log(`Unhandled event type: ${event.type}`);
          }
        } catch (error: any) {
          console.error(' Error in PaymentService.handleWebhookEvent:', {
            message: error.message,
            type: event.type,
          });
          throw error;
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
    
          
          await this._paymentRepository.updateStatus(sessionId, 'completed');
    
          
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

          
    if (payment.adminShare) {
      const admin = await this._adminRepository.findOne({}); 
      if (!admin) throw new Error('Admin not found');

      const course = await this._courseRepository.findById(courseId);
      const courseTitle = course ? course.title : `Course ID: ${courseId}`;

      await this._walletService.creditAdminWallet(
        admin.id.toString(),
        payment.adminShare,
        `Admin share for course: ${courseTitle}`,
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

      async getAllPaymentHistory(page: number, limit: number): Promise<{
        success: boolean;
        message: string;
        data: PaymentHistoryResult;
      }> {
        try {
          const result = await this._paymentRepository.getAllPaymentHistory(page, limit);
          return {
            success: true,
            message: 'Payment history fetched successfully',
            data: result,
          };
        } catch (error: any) {
          console.error('Error in PaymentService.getAllPaymentHistory:', error);
          return {
            success: false,
            message: error.message || 'Failed to fetch payment history',
            data: { payments: [], total: 0 },
          };
        }
      }


}