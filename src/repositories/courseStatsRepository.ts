import { model, Schema } from 'mongoose';
import { courseModel } from '../models/courseModel';
import { enrollmentModel } from '../models/enrollmentModel';
import { Category } from '../models/categoryModel';
import { ICourseStats } from '../interfaces/ICourseStats';
import User from '../models/userModel';

export class CourseStatsRepository {
  private _courseModel = courseModel;
  private _enrollmentModel = enrollmentModel;
  private _categoryModel = Category;
  private _userModel = User;

  async getCourseStats(): Promise<ICourseStats[]> {
    try {
      return await this._courseModel.aggregate([
        {
          $lookup: {
            from: 'categories',
            localField: 'category',
            foreignField: '_id',
            as: 'categoryDetails',
          },
        },
        {
          $lookup: {
            from: 'users',
            localField: 'instructor',
            foreignField: '_id',
            as: 'instructorDetails',
          },
        },
        {
          $lookup: {
            from: 'enrollments',
            localField: '_id',
            foreignField: 'courseId',
            as: 'enrollments',
          },
        },
        {
          $unwind: {
            path: '$categoryDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $unwind: {
            path: '$instructorDetails',
            preserveNullAndEmptyArrays: true,
          },
        },
        {
          $project: {
            _id: 1,
            title: 1,
            price: 1,
            enrolledStudents: { $size: '$enrollments' },
            instructorName: '$instructorDetails.name',
            categoryName: '$categoryDetails.categoryName',
            status: { $cond: [{ $eq: ['$isPublished', true] }, 'published', 'draft'] },
          },
        },
      ]);
    } catch (error) {
      console.error('Error in CourseStatsRepository.getCourseStats:', error);
      throw new Error('Could not fetch course statistics');
    }
  }
}