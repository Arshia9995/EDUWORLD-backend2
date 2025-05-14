import { Schema, model, Document, Types } from 'mongoose';


 export interface IChat extends Document {
    courseId: Types.ObjectId;
    instructorId: Types.ObjectId;
    createdAt: Date;
    participants: Types.ObjectId[];
  }