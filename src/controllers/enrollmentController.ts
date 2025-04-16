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

// EnrollmentController.js
async getEnrolledCourses(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(Status.UN_AUTHORISED).json({
          success: false,
          message: 'Unauthorized: User ID not found',
        });
      }
  
      const userId = req.user.id;
      const page = parseInt(req.query.page as string) || 1;
      const limit = parseInt(req.query.limit as string) || 6;
      const search = req.query.search as string || '';
      const sortBy = req.query.sortBy as string || 'newest';
      const category = req.query.category as string || '';
      const priceRange = req.query.priceRange as string || '';
      const language = req.query.language as string || '';
  
      const result = await this._enrollmentService.getEnrolledCourses(
        userId,
        page,
        limit,
        search,
        sortBy,
        category,
        priceRange,
        language
      );
  
      return res.status(Status.OK).json({
        success: true,
        courses: result.courses,
        totalCourses: result.totalCourses,
        currentPage: result.currentPage,
        totalPages: result.totalPages,
      });
    } catch (error: any) {
      console.error('Error in getEnrolledCourses controller:', error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to fetch enrolled courses',
      });
    }
  }

  async getEnrolledCourse(req: AuthRequest, res: Response) {
    try {
      const { courseId } = req.params;
      
      if (!req.user?.id) {
        return res.status(Status.UN_AUTHORISED).json({
          success: false,
          message: "Unauthorized: Student ID not found",
        });
      }
  
      const result = await this._enrollmentService.getEnrolledCourse(courseId, req.user.id);
  
      if (!result.success) {
        return res.status(Status.BAD_REQUEST).json({
          success: false,
          message: result.message,
        });
      }
  
      return res.status(Status.OK).json({
        success: true,
        message: result.message,
        course: result.data,
      });
    } catch (error: any) {
      console.error('Error fetching enrolled course:', error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to fetch course details',
      });
    }
  }

  async getCourseLessons(req: AuthRequest, res: Response) {
    try {
      const { courseId } = req.params;

      if (!req.user?.id) {
        return res.status(Status.UN_AUTHORISED).json({
          success: false,
          message: "Unauthorized: Student ID not found",
        });
      }

      const result = await this._enrollmentService.getCourseLessons(courseId, req.user.id);

      if (!result.success) {
        const status = result.message === 'Course not found' ? Status.NOT_FOUND : Status.BAD_REQUEST;
        return res.status(status).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(Status.OK).json({
        success: true,
        message: result.message,
        lessons: result.data,
      });
    } catch (error: any) {
      console.error("Error fetching lessons:", error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || "Failed to fetch lessons",
      });
    }
  }

  async getEnrolledCourseById(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(Status.UN_AUTHORISED).json({
          success: false,
          message: 'Unauthorized: User ID not found',
        });
      }

      const { courseId } = req.params;
      const userId = req.user.id;

      const result = await this._enrollmentService.getEnrolledCourseById(courseId, userId);

      if (!result.success) {
        const status = result.message === 'Course not found' || result.message === 'Not enrolled in this course' 
          ? Status.NOT_FOUND 
          : Status.BAD_REQUEST;
        return res.status(status).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(Status.OK).json({
        success: true,
        message: result.message,
        course: result.data,
      });
    } catch (error: any) {
      console.error('Error in getEnrolledCourseById controller:', error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to fetch enrolled course',
      });
    }
  }

  async getEnrolledLessonsByCourseId(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(Status.UN_AUTHORISED).json({
          success: false,
          message: 'Unauthorized: User ID not found',
        });
      }

      const { courseId } = req.params;
      const userId = req.user.id;

      const result = await this._enrollmentService.getEnrolledLessonsByCourseId(courseId, userId);

      if (!result.success) {
        const status = result.message === 'Lessons not found' || result.message === 'Not enrolled in this course' 
          ? Status.NOT_FOUND 
          : Status.BAD_REQUEST;
        return res.status(status).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(Status.OK).json({
        success: true,
        message: result.message,
        lessons: result.data,
      });
    } catch (error: any) {
      console.error('Error in getEnrolledLessonsByCourseId controller:', error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to fetch enrolled lessons',
      });
    }
  }

  async getEnrolledCourseDetails(req: AuthRequest, res: Response) {
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
      const result = await this._enrollmentService.getEnrolledCourseDetails(userId, courseId);

      if (!result.success) {
        return res.status(Status.NOT_FOUND).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(Status.OK).json({
        success: true,
        message: result.message,
        course: result.course,
        enrollment: result.enrollment,
      });
    } catch (error: any) {
      console.error('Error in getEnrolledCourseDetails controller:', error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to fetch course details',
      });
    }
  }

  async updateLessonProgress(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(Status.UN_AUTHORISED).json({
          success: false,
          message: 'Unauthorized: User ID not found',
        });
      }

      const { courseId, lessonId, status } = req.body;
      if (!courseId || !lessonId || !status) {
        return res.status(Status.BAD_REQUEST).json({
          success: false,
          message: 'Course ID, Lesson ID, and status are required',
        });
      }

      const userId = req.user.id;
      const result = await this._enrollmentService.updateLessonProgress(userId, courseId, lessonId, status);

      if (!result.success) {
        return res.status(Status.BAD_REQUEST).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(Status.OK).json({
        success: true,
        message: result.message,
        enrollment: result.enrollment,
      });
    } catch (error: any) {
      console.error('Error in updateLessonProgress controller:', error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to update lesson progress',
      });
    }
  }
  
}

export default EnrollmentController;