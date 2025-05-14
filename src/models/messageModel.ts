import { Schema, model, Document, Types } from 'mongoose';
import { IMessage } from '../interfaces/IMessage';


const messageSchema = new Schema<IMessage>(
    {
      chatId: {
        type: Schema.Types.ObjectId,
        ref: 'Chat',
        required: true,
      },
      senderId: {
        type: Schema.Types.ObjectId,
        ref: 'User',
        required: true,
      },
      content: {
        type: String,
        required: false,
        trim: true,
      },
      media: {
        url: { type: String, required: false },
        type: { type: String, enum: ['image', 'video', 'file'], required: false },
      },
      sentAt: {
        type: Date,
        default: Date.now,
      },
      readBy: [
        {
          userId: {
            type: Schema.Types.ObjectId,
            ref: 'User',
            required: true,
          },
          readAt: {
            type: Date,
            default: Date.now,
          },
        },
      ],
    },
    {
      timestamps: true,
    }
  );


   export const Message = model<IMessage>('Message', messageSchema);
