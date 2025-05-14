// models/activityLogModel.ts
import mongoose, { Schema, Document } from 'mongoose';
import { IActivity } from '../interfaces/IActivity';

const activityLogSchema = new Schema<IActivity>({
  activityType: { type: String, required: true }, 
  details: { type: String, required: true }, 
  timestamp: { type: Date, default: Date.now },
});

export const activityLogModel = mongoose.model<IActivity>('ActivityLog', activityLogSchema);