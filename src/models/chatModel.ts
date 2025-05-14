import { Schema, model, Document, Types } from 'mongoose';
import { IChat } from '../interfaces/IChat';


const chatSchema = new Schema<IChat>(
    {
      courseId: {
        type: Schema.Types.ObjectId,
        ref: 'courses',
        required: true,
        unique: true, 
      },
      instructorId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      createdAt: {
        type: Date,
        default: Date.now,
      },
      participants: [
        {
          type: Schema.Types.ObjectId,
          ref: 'User',
        },
      ],
    },
    {
      timestamps: true,
    }
  );

  export const Chat = model<IChat>('Chat', chatSchema);