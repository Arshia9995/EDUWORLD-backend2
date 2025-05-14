import { Schema, model, Document, Types } from 'mongoose';



 export interface IMessage extends Document {
    chatId: Types.ObjectId;
    senderId: Types.ObjectId;
    content: string;
    media?: {
      url: string;
      type: 'image' | 'video' | 'file';
    };
    sentAt: Date;
    readBy: Array<{
      userId: Types.ObjectId;
      readAt: Date;
    }>;
  }