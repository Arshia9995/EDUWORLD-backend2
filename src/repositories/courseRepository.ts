import { ICourse } from "../interfaces/ICourse";
import { courseModel } from "../models/courseModel";
import { BaseRepository } from "./baseRepository";

class CourseRepository extends BaseRepository<ICourse>{
    constructor() {
        super(courseModel)
        
    }


    async findPublishedByInstructor(instructorId: string): Promise<ICourse[]> {
        try {
          return await this._model
            .find({ instructor: instructorId, isPublished: true })
            .populate("category", "categoryName")
            .populate("instructor", "name")
            .sort({ createdAt: -1 })
            .exec();
        } catch (error) {
          console.error("Error fetching published courses by instructor:", error);
          throw new Error("Could not fetch published courses");
        }
      }

      async findByIdWithPopulate(id: string): Promise<ICourse | null> {
        try {
          return await this._model.findById(id)
            .populate('instructor', 'name')
            .populate('category', 'categoryName isActive')
            .lean();
        } catch (error) {
          console.error("Error fetching course by ID with populate:", error);
          throw new Error("Could not fetch course with related data");
        }
      }

      async findAllPublishedCourses(): Promise<ICourse[]> {
        try {
          const courses = await this._model
            .find({ isPublished: true, isBlocked: false })
            .populate('instructor', 'name')
            .populate('category', 'categoryName isActive')
            .sort({ createdAt: -1 })
            .lean();
    
          return courses;
        } catch (error) {
          console.error('Error in CourseRepository.findAllPublishedCourses:', error);
          throw new Error('Could not fetch published courses');
        }
      }

      async findStudentCourseById(courseId: string): Promise<ICourse | null> {
        try {
          const course = await this._model
            .findOne({ _id: courseId, isPublished: true, isBlocked: false })
            .populate('instructor', 'name')
            .populate('category', 'categoryName isActive')
            .lean();
    
          return course || null;
        } catch (error) {
          console.error('Error in CourseRepository.findStudentCourseById:', error);
          throw new Error('Could not fetch course');
        }
      }


      async update(courseId: string, updateData: any): Promise<ICourse | null> {
        try {
          const updatedCourse = await this._model
            .findByIdAndUpdate(
              courseId,
              { $set: updateData },
              { new: true, runValidators: true }
            )
            .populate('instructor', 'name')
            .populate('category', 'categoryName isActive')
            .lean();
      
          return updatedCourse || null;
        } catch (error) {
          console.error('Error in CourseRepository.update:', error);
          throw new Error('Could not update course');
        }
      }

}

export default CourseRepository;