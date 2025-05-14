import { Document, Types } from "mongoose";

export interface AnnouncementDoc extends Document {
  title: string;
  content: string;
  createdBy: Types.ObjectId;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}