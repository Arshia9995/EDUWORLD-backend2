import mongoose from "mongoose";
import { IEnrollment } from "../interfaces/IEnrollment";
import { enrollmentModel } from "../models/enrollmentModel";
import { BaseRepository } from "./baseRepository";

class EnrollmentRepository extends BaseRepository<IEnrollment> {
  constructor() {
    super(enrollmentModel);
  }

  async create(enrollmentData: Partial<IEnrollment>): Promise<IEnrollment> {
    try {
      const enrollment = await this._model.create(enrollmentData);
      return enrollment;
    } catch (error) {
      console.error('Error in EnrollmentRepository.create:', error);
      throw new Error('Could not create enrollment');
    }
  }

  async findByUserAndCourse(userId: string, courseId: string): Promise<IEnrollment | null> {
    try {
      console.log('findByUserAndCourse called with userId:', userId, 'courseId:', courseId);
      const objectIdUser = new mongoose.Types.ObjectId(userId);
      const objectIdCourse = new mongoose.Types.ObjectId(courseId);
      console.log('Converted ObjectIds:', { objectIdUser, objectIdCourse });
  
      const enrollment = await this._model
        .findOne({
          userId: objectIdUser,
          courseId: objectIdCourse,
        })
        .lean();
      console.log('Query result:', enrollment);
  
      return enrollment;
    } catch (error:any) {
      console.error('Error in EnrollmentRepository.findByUserAndCourse:', {
        error: error.message,
        stack: error.stack,
        userId,
        courseId,
      });
      throw new Error('Could not fetch enrollment');
    }
  }
}

export default EnrollmentRepository;