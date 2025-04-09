import { Request, Response } from "express";
import { EnrollmentService } from "../services/enrollmentService";
import { Status } from "../utils/enums";
import { IEnrollment } from "../interfaces/IEnrollment";
import { AuthRequest } from "../middleware/authMiddleware";

class EnrollmentController {
  constructor(private readonly _enrollmentService: EnrollmentService) {}

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

  async createEnrollment(req: AuthRequest, res: Response) {
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
      const enrollment = await this._enrollmentService.enrollUser(userId, courseId);

      return res.status(Status.OK).json({
        success: true,
        message: 'Enrollment created successfully',
        enrollment,
      });
    } catch (error: any) {
      console.error('Error in createEnrollment controller:', error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to create enrollment',
      });
    }
  }
}

export default EnrollmentController;