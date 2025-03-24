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
}

export default LessonRepository;