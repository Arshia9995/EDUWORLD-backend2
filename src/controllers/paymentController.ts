import { Request, Response } from "express";
import { PaymentService } from "../services/paymentService";
import { Status } from "../utils/enums";
import { AuthRequest } from "../middleware/authMiddleware";
import { EnrollmentService } from "../services/enrollmentService";

class PaymentController {
  constructor(
    private readonly _paymentService: PaymentService,
    private readonly _enrollmentService: EnrollmentService
  ) {}

  async createCheckoutSession(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(Status.UN_AUTHORISED).json({
          success: false,
          message: 'Unauthorized: User ID not found',
        });
      }

      const { courseId } = req.body;
      if (!courseId) {
        return res.status(Status.BAD_REQUEST).json({
          success: false,
          message: 'Course ID is required',
        });
      }

      const userId = req.user.id;
      const sessionId = await this._paymentService.createCheckoutSession(courseId, userId);

      return res.status(Status.OK).json({
        success: true,
        message: 'Checkout session created successfully',
        sessionId,
      });
    } catch (error: any) {
      console.error('Error in createCheckoutSession controller:', error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to create checkout session',
      });
    }
  }

//   async verifyPayment(req: AuthRequest, res: Response) {
//     try {
//       const { session_id } = req.query;

//       if (!session_id || typeof session_id !== 'string') {
//         return res.status(Status.BAD_REQUEST).json({
//           success: false,
//           message: 'Session ID is required',
//         });
//       }

//       const { userId, courseId } = await this._paymentService.verifyPayment(session_id);

//       await this._enrollmentService.enrollUser(userId, courseId);

//       return res.status(Status.OK).json({
//         success: true,
//         message: 'Enrollment successful',
//       });
//     } catch (error: any) {
//       console.error('Error in verifyPayment controller:', error);
//       return res.status(Status.INTERNAL_SERVER_ERROR).json({
//         success: false,
//         message: error.message || 'Failed to verify payment',
//       });
//     }
//   }

async verifyPayment(req: AuthRequest, res: Response) {
    try {
      const { session_id } = req.query;
      console.log('Verifying payment for session_id:', session_id);
      if (!session_id || typeof session_id !== 'string') {
        return res.status(Status.BAD_REQUEST).json({
          success: false,
          message: 'Session ID is required',
        });
      }
      const { userId, courseId } = await this._paymentService.verifyPayment(session_id);
      console.log('Payment verified, enrolling user:', { userId, courseId });
      await this._enrollmentService.enrollUser(userId, courseId);
      return res.status(Status.OK).json({
        success: true,
        message: 'Enrollment successful',
      });
    } catch (error: any) {
      console.error('Error in verifyPayment controller:', error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to verify payment',
      });
    }
  }

  async checkEnrollment(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(Status.UN_AUTHORISED).json({
          success: false,
          message: 'Unauthorized: User ID not found',
        });
      }

      const { courseId } = req.params;
      if (!courseId) {
        return res.status(Status.BAD_REQUEST).json({
          success: false,
          message: 'Course ID is required',
        });
      }

      const userId = req.user.id;
      const isEnrolled = await this._enrollmentService.checkEnrollment(userId, courseId);

      return res.status(Status.OK).json({
        success: true,
        isEnrolled,
      });
    } catch (error: any) {
      console.error('Error in checkEnrollment controller:', error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to check enrollment',
      });
    }
  }
}

export default PaymentController;