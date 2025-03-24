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


}

export default CourseRepository;