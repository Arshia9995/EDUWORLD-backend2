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
    
          // Ensure the instructor ID is available from the authenticated user
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


}

export default LessonController;