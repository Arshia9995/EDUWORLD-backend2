import { ICourse } from "../interfaces/ICourse";
import CourseRepository from "../repositories/courseRepository";
import { ICourseService } from "../interfaces/IServices";


export class CourseServices implements ICourseService {
    constructor(
        private _courseRepository: CourseRepository
    ){
        this._courseRepository =  _courseRepository;
    }


    async addCourse(courseData: Partial<ICourse>) {
        try {
          // Validate required fields
          if (
            !courseData.title ||
            !courseData.description ||
            !courseData.instructor ||
            !courseData.category
          ) {
            return { success: false, message: 'Missing required fields', data: null };
          }
    
          // Create the course in the database
          const course = await this._courseRepository.create(courseData);
          return {
            success: true,
            message: 'Course created successfully',
            data: course,
          };
        } catch (error) {
          console.error('Error adding course:', error);
          return { success: false, message: 'Internal server error', data: null };
        }
      }





}
