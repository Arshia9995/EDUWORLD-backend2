import mongoose from "mongoose";
import { ILesson } from "../interfaces/ILesson";
import { lessonModel } from "../models/lessonModel";
import { BaseRepository } from "./baseRepository";

class LessonRepository extends BaseRepository<ILesson>{
    constructor() {
        super(lessonModel)
    }

    async findLessonsByCourseId(courseId: string) {
        try {
          return await this._model.find({ course: new mongoose.Types.ObjectId(courseId) }).lean();
        } catch (error) {
          console.error("Error fetching lessons by course ID:", error);
          throw new Error("Could not fetch lessons");
        }
      }
      async findByCourseId(courseId: string, userRole: string): Promise<ILesson[]> {
        try {
          // Define the fields to exclude based on the user role
          const selectFields = userRole === 'student' ? '-video' : ''; // Exclude video for students
    
          const lessons = await this._model
            .find({ course: courseId })
            .select(selectFields) // Exclude the video field for students
            .lean();
    
          return lessons;
        } catch (error) {
          console.error('Error in LessonRepository.findByCourseId:', error);
          throw new Error('Could not fetch lessons');
        }
      }
}

export default LessonRepository;