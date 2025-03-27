import { Request, Response } from "express";
import { Status } from "../utils/enums";
import { LessonServices } from "../services/lessonService";
import { AuthRequest } from "../middleware/authMiddleware";
import CourseController from "./courseController";

class LessonController {
    constructor(private _lessonService: LessonServices) {
        this._lessonService = _lessonService;
    }


    async addLesson(req: AuthRequest, res: Response) {
        try {
          const { title, description, video, course, duration } = req.body;
    
          const lessonData = {
            title,
            description,
            video,
            course,
            duration,
          };
    
          
          if (!req.user?.id) {
            return res.status(Status.UN_AUTHORISED).json({
              message: "Unauthorized: Instructor ID not found",
            });
          }
    
          const result = await this._lessonService.addLesson(lessonData, req.user.id);
    
          if (!result.success) {
            return res.status(Status.BAD_REQUEST).json({ message: result.message });
          }
    
          return res.status(Status.CREATED).json({
            message: result.message,
            lesson: result.data,
          });
        } catch (error: any) {
          console.error("Error in addLesson controller:", error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            message: "Internal server error",
          });
        }
      }

      async getLessonsByCourseId(req: AuthRequest, res: Response) {
        try {
          const { courseId } = req.params;
    
          if (!req.user?.id) {
            return res.status(Status.UN_AUTHORISED).json({
              success: false,
              message: "Unauthorized: Instructor ID not found",
            });
          }
    
          const result = await this._lessonService.getLessonsByCourseId(courseId, req.user.id);
    
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

      async getStudentLessonsByCourseId(req: AuthRequest, res: Response) {
        try {
          if (!req.user?.id) {
            return res.status(Status.UN_AUTHORISED).json({
              success: false,
              message: 'Unauthorized: User ID not found',
            });
          }
    
          const { courseId } = req.params;
          const userRole = req.user.role; 
    
          const result = await this._lessonService.getStudentLessonsByCourseId(courseId, userRole);
    
          if (!result.success) {
            const status = result.message === 'Lessons not found' ? Status.NOT_FOUND : Status.BAD_REQUEST;
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
          console.error('Error in getLessonsByCourseId controller:', error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Failed to fetch lessons',
          });
        }
      }


      async updateLesson(req: AuthRequest, res: Response) {
        try {
          const { lessonId } = req.params;
          const { title, description, video, course, duration } = req.body;
    
          const lessonData = {
            title,
            description,
            video,
            course,
            duration,
          };
    
          if (!req.user?.id) {
            return res.status(Status.UN_AUTHORISED).json({
              success: false,
              message: "Unauthorized: Instructor ID not found",
            });
          }
    
          const result = await this._lessonService.updateLesson(lessonId, lessonData, req.user.id);
    
          if (!result.success) {
            const status = result.message === 'Lesson not found' ? Status.NOT_FOUND : Status.BAD_REQUEST;
            return res.status(status).json({
              success: false,
              message: result.message,
            });
          }
    
          return res.status(Status.OK).json({
            success: true,
            message: result.message,
            lesson: result.data,
          });
        } catch (error: any) {
          console.error("Error in updateLesson controller:", error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || "Failed to update lesson",
          });
        }
      }

      

}

export default LessonController;