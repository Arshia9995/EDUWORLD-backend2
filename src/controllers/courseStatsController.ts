import { Response } from 'express';
import { AuthRequest } from '../middleware/authMiddleware';
import { CourseStatsService } from '../services/courseStatsService';
import { Status } from '../utils/enums';

export class CourseStatsController {
  private _courseStatsService: CourseStatsService;

  constructor(courseStatsService: CourseStatsService) {
    this._courseStatsService = courseStatsService;
  }

  async getCourseStats(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id) {
        return res.status(Status.UN_AUTHORISED).json({
          success: false,
          message: 'Unauthorized: Admin access required',
        });
      }

      const stats = await this._courseStatsService.getCourseStats();

      return res.status(Status.OK).json(stats);
    } catch (error: any) {
      console.error('Error in CourseStatsController.getCourseStats:', error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: error.message || 'Failed to fetch course stats',
      });
    }
  }
}