// repositories/activityLogRepository.ts
import mongoose, { Model } from 'mongoose';
import { IActivity } from '../interfaces/IActivity';
import { activityLogModel } from '../models/activityModel';
import { BaseRepository } from './baseRepository';

class ActivityLogRepository extends BaseRepository<IActivity> {
  constructor() {
    super(activityLogModel);
  }

  
  async getRecentActivities(limit: number = 5): Promise<IActivity[]> {
    try {
      return await this._model
        .find()
        .sort({ timestamp: -1 }) 
        .limit(limit)
        .lean();
    } catch (error) {
      console.error('Error in ActivityLogRepository.getRecentActivities:', error);
      throw new Error('Could not fetch recent activities');
    }
  }
}

export default ActivityLogRepository;