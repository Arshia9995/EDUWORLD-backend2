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
          
          const selectFields = userRole === 'student' ? '-video' : ''; 
    
          const lessons = await this._model
            .find({ course: courseId })
            .select(selectFields) 
            .lean();
    
          return lessons;
        } catch (error) {
          console.error('Error in LessonRepository.findByCourseId:', error);
          throw new Error('Could not fetch lessons');
        }
      }
      async findByEnrolledCourseId(courseId: string, userRole: string): Promise<ILesson[]> {
        try {
          
          const selectFields = userRole === 'student' ? '-video' : ''; 
    
          const lessons = await this._model
            .find({ course: courseId })
            .select(selectFields) 
            .lean();
    
          return lessons;
        } catch (error) {
          console.error('Error in LessonRepository.findByCourseId:', error);
          throw new Error('Could not fetch lessons');
        }
      }

      async countLessonsByCourse(courseId: string): Promise<number> {
        try {
          const count = await this._model.countDocuments({ course: courseId });
          return count;
        } catch (error: any) {
          console.error('Error in LessonRepository.countLessonsByCourse:', { error: error.message, courseId });
          throw new Error('Could not count lessons');
        }
      }
}

export default LessonRepository;