import { CourseStatsRepository } from '../repositories/courseStatsRepository';
import { ICourseStats } from '../interfaces/ICourseStats';

export class CourseStatsService {
  private _courseStatsRepository: CourseStatsRepository;

  constructor(courseStatsRepository: CourseStatsRepository) {
    this._courseStatsRepository = courseStatsRepository;
  }

  async getCourseStats() {
    try {
      const courseStats = await this._courseStatsRepository.getCourseStats();
      return {
        success: true,
        data: courseStats,
        message: 'Course statistics fetched successfully',
      };
    } catch (error: any) {
      console.error('Error in CourseStatsService.getCourseStats:', error);
      return {
        success: false,
        data: [],
        message: error.message || 'Failed to fetch course stats',
      };
    }
  }
}