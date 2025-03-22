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


}

export default CourseController;