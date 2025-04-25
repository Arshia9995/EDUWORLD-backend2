import mongoose from "mongoose";
import { IEnrollment } from "../interfaces/IEnrollment";
import { enrollmentModel } from "../models/enrollmentModel";
import { BaseRepository } from "./baseRepository";
import { Types } from 'mongoose';

class EnrollmentRepository extends BaseRepository<IEnrollment> {
  constructor() {
    super(enrollmentModel);
  }

//   async create(enrollmentData: Partial<IEnrollment>): Promise<IEnrollment> {
//     try {
//       const enrollment = await this._model.create(enrollmentData);
//       return enrollment;
//     } catch (error) {
//       console.error('Error in EnrollmentRepository.create:', error);
//       throw new Error('Could not create enrollment');
//     }
//   }

//   async findByUserAndCourse(userId: string, courseId: string): Promise<IEnrollment | null> {
//     try {
//       console.log('findByUserAndCourse called with userId:', userId, 'courseId:', courseId);
//       const objectIdUser = new mongoose.Types.ObjectId(userId);
//       const objectIdCourse = new mongoose.Types.ObjectId(courseId);
//       console.log('Converted ObjectIds:', { objectIdUser, objectIdCourse });
  
//       const enrollment = await this._model
//         .findOne({
//           userId: objectIdUser,
//           courseId: objectIdCourse,
//         })
//         .lean();
//       console.log('Query result:', enrollment);
  
//       return enrollment;
//     } catch (error:any) {
//       console.error('Error in EnrollmentRepository.findByUserAndCourse:', {
//         error: error.message,
//         stack: error.stack,
//         userId,
//         courseId,
//       });
//       throw new Error('Could not fetch enrollment');
//     }
//   }



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
      const objectIdUser = new mongoose.Types.ObjectId(userId);
      const objectIdCourse = new mongoose.Types.ObjectId(courseId);
      const enrollment = await this._model.findOne({ userId: objectIdUser, courseId: objectIdCourse }).lean();
      return enrollment;
    } catch (error: any) {
      console.error('Error in EnrollmentRepository.findByUserAndCourse:', { error: error.message, userId, courseId });
      throw new Error('Could not fetch enrollment');
    }
  }

  async findByUser(userId: mongoose.Types.ObjectId): Promise<IEnrollment[]> {
    try {
      const enrollments = await this._model.find({ userId }).lean();
      return enrollments;
    } catch (error: any) {
      console.error('Error in EnrollmentRepository.findByUser:', { error: error.message, userId });
      throw new Error('Could not fetch enrollments');
    }
  }

  async findEnrollment(studentId: string, courseId: string): Promise<IEnrollment | null> {
    try {
      return await this._model.findOne({
        student: new Types.ObjectId(studentId),
        course: new Types.ObjectId(courseId),
        status: 'active'
      });
    } catch (error) {
      console.error("Error finding enrollment:", error);
      throw new Error("Could not find enrollment");
    }
  }

  async findStudentEnrollments(studentId: string): Promise<IEnrollment[]> {
    try {
      return await this._model.find({
        student: new Types.ObjectId(studentId),
        status: 'active'
      });
    } catch (error) {
      console.error("Error finding student enrollments:", error);
      throw new Error("Could not find student enrollments");
    }
  }

  async checkEnrollment(userId: string, courseId: string): Promise<boolean> {
    try {
      const enrollment = await this._model.findOne({ userId, courseId }).lean();
      return !!enrollment;
    } catch (error) {
      console.error('Error in EnrollmentRepository.checkEnrollment:', error);
      throw new Error('Could not verify enrollment');
    }
  }


  // Get total unique students enrolled in a list of courses
  async getTotalStudentsByCourses(courseIds: string[]): Promise<number> {
    try {
      const uniqueStudents = await this._model
        .distinct('userId', {
          courseId: { $in: courseIds.map((id) => new mongoose.Types.ObjectId(id)) },
        })
        .countDocuments();
      return uniqueStudents;
    } catch (error) {
      console.error('Error in EnrollmentRepository.getTotalStudentsByCourses:', error);
      throw new Error('Could not fetch total students');
    }
  }

  // Get enrollment timeline (last 12 months)
  async getEnrollmentTimeline(): Promise<{ _id: string; count: number }[]> {
    try {
      const twelveMonthsAgo = new Date();
      twelveMonthsAgo.setMonth(twelveMonthsAgo.getMonth() - 12);

      return await this._model.aggregate([
        {
          $match: {
            enrolledAt: { $gte: twelveMonthsAgo },
          },
        },
        {
          $group: {
            _id: { $dateToString: { format: '%Y-%m', date: '$enrolledAt' } },
            count: { $sum: 1 },
          },
        },
        { $sort: { '_id': 1 } },
      ]);
    } catch (error) {
      console.error('Error in EnrollmentRepository.getEnrollmentTimeline:', error);
      throw new Error('Could not fetch enrollment timeline');
    }
  }

  async getTotalStudents(): Promise<number> {
    try {
      return await this._model.distinct('userId').countDocuments();
    } catch (error) {
      console.error('Error in EnrollmentRepository.getTotalStudents:', error);
      throw new Error('Could not fetch total students');
    }
  }
}

export default EnrollmentRepository;