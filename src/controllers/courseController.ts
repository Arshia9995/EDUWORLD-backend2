import { Request, Response } from "express";
import { Status } from "../utils/enums";
import { CourseServices } from "../services/courseService";
import { AuthRequest } from "../middleware/authMiddleware";

class CourseController {
    constructor(private _courseService: CourseServices) {
        this._courseService = _courseService
    }


    async addCourse(req: AuthRequest, res: Response) {
        try {
          const { title, description, category, price, language, thumbnail } = req.body;
    
          const courseData = {
            title,
            description,
            instructor:req.user?.id,
            category,
            price: parseFloat(price), // Convert string to number
            language,
            thumbnail
          };
    
          const result = await this._courseService.addCourse(courseData);
    
          if (!result.success) {
            return res.status(Status.BAD_REQUEST).json({ message: result.message });
          }
    
          return res.status(Status.CREATED).json({
            message: result.message,
            course: result.data,
          });
        } catch (error: any) {
          console.error('Error in addCourse controller:', error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            message: 'Internal server error',
          });
        }
      }


      async publishCourse(req: AuthRequest, res: Response) {
        try {
          const { courseId } = req.body;
    
          if (!courseId) {
            return res.status(Status.BAD_REQUEST).json({
              success: false,
              message: "Course ID is required",
            });
          }
    
          
          if (!req.user?.id) {
            return res.status(Status.UN_AUTHORISED).json({
              success: false,
              message: "Unauthorized: Instructor ID not found",
            });
          }
    
          const result = await this._courseService.publishCourse(courseId, req.user.id);
    
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
          console.error("Error in publishCourse controller:", error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
          });
        }
      }

      async getPublishedCourses(req: AuthRequest, res: Response) {
        try {
          if (!req.user?.id) {
            return res.status(Status.UN_AUTHORISED).json({
              success: false,
              message: "Unauthorized: Instructor ID not found",
            });
          }
    
          const result = await this._courseService.getPublishedCoursesByInstructor(req.user.id);
    
          if (!result.success) {
            return res.status(Status.BAD_REQUEST).json({
              success: false,
              message: result.message,
            });
          }
    
          return res.status(Status.OK).json({
            success: true,
            message: result.message,
            courses: result.data,
          });
        } catch (error: any) {
          console.error("Error in getPublishedCourses controller:", error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
          });
        }
      }

      async getCourseById(req: AuthRequest, res: Response) {
        try {
          const { courseId } = req.params;
          console.log(courseId,"courseId")
          if (!req.user?.id) {
            return res.status(Status.UN_AUTHORISED).json({
              success: false,
              message: "Unauthorized: Instructor ID not found",
            });
          }
      
          const result = await this._courseService.getCourseById(courseId, req.user.id);
          console.log(result,"This is ressult for getcourseBy ID")
      
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
          console.error('Error fetching course:', error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Failed to fetch course details',
          });
        }
      }

      async getAllPublishedCourses(req: AuthRequest, res: Response) {
        try {
          if (!req.user?.id) {
            return res.status(Status.UN_AUTHORISED).json({
              success: false,
              message: "Unauthorized: User ID not found",
            });
          }
    
          const result = await this._courseService.getAllPublishedCourses();
    
          if (!result.success) {
            return res.status(Status.BAD_REQUEST).json({
              success: false,
              message: result.message,
            });
          }
    
          return res.status(Status.OK).json({
            success: true,
            message: result.message,
            courses: result.data,
          });
        } catch (error: any) {
          console.error('Error in getAllPublishedCourses controller:', error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: "Internal server error",
          });
        }
      }

      async getStudentCourseById(req: AuthRequest, res: Response) {
        try {
          if (!req.user?.id) {
            return res.status(Status.UN_AUTHORISED).json({
              success: false,
              message: "Unauthorized: User ID not found",
            });
          }
    
          const { courseId } = req.params;
    
          const result = await this._courseService.getStudentCourseById(courseId);
    
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
            course: result.data,
          });
        } catch (error: any) {
          console.error('Error in getStudentCourseById controller:', error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Failed to fetch course',
          });
        }
      }


      async updateCourse(req: AuthRequest, res: Response) {
        try {
          if (!req.user?.id) {
            return res.status(Status.UN_AUTHORISED).json({
              success: false,
              message: 'Unauthorized: User ID not found',
            });
          }
      
          const { courseId } = req.params;
          const userId = req.user.id;
          const updateData = req.body;
      
          const result = await this._courseService.updateCourse(courseId, userId, updateData);
      
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
            course: result.data,
          });
        } catch (error: any) {
          console.error('Error in updateCourse controller:', error);
          return res.status(Status.INTERNAL_SERVER_ERROR).json({
            success: false,
            message: error.message || 'Failed to update course',
          });
        }
      }

      



     

}

export default CourseController;