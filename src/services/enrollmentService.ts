import { IEnrollment } from "../interfaces/IEnrollment";
import EnrollmentRepository from "../repositories/enrollmentRepository";
import { enrollmentModel } from "../models/enrollmentModel";
import { IEnrollmentService } from "../interfaces/IServices";
import { ObjectId } from 'mongodb';

export class EnrollmentService implements IEnrollmentService {
  constructor(private readonly _enrollmentRepository: EnrollmentRepository) {}

  async enrollUser(userId: string, courseId: string): Promise<IEnrollment> {
    try {
      console.log('Validating ObjectIds:', { userId, courseId });
      new ObjectId(userId); // Throws if invalid
      new ObjectId(courseId); // Throws if invalid
      console.log('ObjectIds validated successfully');
  
      console.log('Checking existing enrollment for userId:', userId, 'courseId:', courseId);
      const existingEnrollment = await this._enrollmentRepository.findByUserAndCourse(userId, courseId);
      if (existingEnrollment) {
        console.log('User is already enrolled, skipping re-enrollment');
        return existingEnrollment;
      }
  
      console.log('Creating new enrollment with data:', {
        userId: new ObjectId(userId),
        courseId: new ObjectId(courseId),
        enrolledAt: new Date(),
        completionStatus: 'enrolled',
      });
      const enrollment = await this._enrollmentRepository.create({
        userId: new ObjectId(userId),
        courseId: new ObjectId(courseId),
        enrolledAt: new Date(),
        completionStatus: 'enrolled',
      });
      console.log('Enrollment created successfully:', enrollment);
      return enrollment;
    } catch (error: any) {
      console.error('Detailed error in EnrollmentService.enrollUser:', {
        message: error.message,
        stack: error.stack,
        userId,
        courseId,
      });
      throw new Error(error.message || 'Failed to enroll user');
    }
  }

  async checkEnrollment(userId: string, courseId: string): Promise<boolean> {
    try {
      new ObjectId(userId); // Throws if invalid
      new ObjectId(courseId); // Throws if invalid

      const enrollment = await this._enrollmentRepository.findByUserAndCourse(userId, courseId);
      return !!enrollment;
    } catch (error: any) {
      console.error('Error in EnrollmentService.checkEnrollment:', error);
      throw new Error(error.message || 'Failed to check enrollment');
    }
  }
}