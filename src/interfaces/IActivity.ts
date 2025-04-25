// interfaces/IActivityLog.ts
import { Document } from 'mongoose';

export interface IActivity extends Document {
  activityType: string;
  details: string;
  timestamp: Date;
}