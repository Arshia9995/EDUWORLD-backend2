import mongoose from "mongoose";
import { IMessage } from "../interfaces/IMessage";
import { Message } from "../models/messageModel";
import { BaseRepository } from './baseRepository';
import AWS from 'aws-sdk';
import dotenv from "dotenv";

dotenv.config();

class MessageRepository extends BaseRepository<IMessage> {
    private s3: AWS.S3;

  constructor() {
    super(Message);
    this.s3 = new AWS.S3({
        accessKeyId: process.env.ACCESS_KEY,
        secretAccessKey: process.env.SECRET_ACCESS_KEY,
        region: process.env.AWS_REGION,
        signatureVersion: 'v4',
      });
  }

  async findByChatId(chatId: string): Promise<IMessage[]> {
    try {
      const messages = await this._model
        .find({ chatId })
        .populate({
          path: 'senderId',
          select: 'name role', // Match the population fields used in ChatModal
        })
        .select('content media sentAt senderId readBy') // Match the fields selected in getMessages
        .sort({ sentAt: 1 })
        .lean()
        .exec();
  
      // Generate presigned URLs for media, matching the getMessages approach
      for (const message of messages) {
        if (message.media && message.media.url) {
          try {
            const key = message.media.url.split('.com/')[1]; // Extract the S3 key from the permanent URL
            const downloadParams = {
              Bucket: process.env.BUCKET_NAME!,
              Key: key,
              Expires: 86400, // Presigned URL valid for 24 hours, matching getMessages
            };
            message.media.url = await this.s3.getSignedUrlPromise('getObject', downloadParams);
          } catch (error) {
            console.error(`Failed to generate presigned URL for media URL ${message.media.url}:`, error);
            // Continue with the original URL if presigned URL generation fails
          }
        }
      }
  
      return messages;
    } catch (error) {
      console.error('Error in MessageRepository.findByChatId:', error);
      throw new Error('Could not fetch messages');
    }
  }

  async createMessage(
    chatId: string,
    senderId: string,
    content: string,
    media?: { url: string; type: 'image' | 'video' | 'file' }
  ): Promise<IMessage> {
    try {
      const message = await this._model.create({
        chatId,
        senderId,
        content,
        media,
        sentAt: new Date(),
        isRead: false,
      });
      const populatedMessage = await message.populate("senderId")
      return populatedMessage;
    } catch (error) {
      console.error("Error in MessageRepository.createMessage:", error);
      throw new Error("Could not create message");
    }
  }
//,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,,


async getMessages(chatId: string): Promise<IMessage[]> {
    try {
        const messages = await this._model
        .find({ chatId })
        .populate({
          path: 'senderId',
          select: 'name profile.profileImage',
        })
        .select('content media sentAt senderId readBy')
        .sort({ sentAt: 1 })
        .lean()
        .exec();

        for (const message of messages) {
            if (message.media && message.media.url) {
              const key = message.media.url.split('.com/')[1]; // Extract the S3 key from the permanent URL
              const downloadParams = {
                Bucket: process.env.BUCKET_NAME!,
                Key: key,
                Expires: 86400, // Presigned URL valid for 24 hours
              };
              message.media.url = await this.s3.getSignedUrlPromise('getObject', downloadParams);
            }
          }

          return messages;
    } catch (error) {
      console.error('Error in MessageRepository.getMessages:', error);
      throw new Error('Could not fetch messages');
    }
  }

  async instructorCreateMessage(
    chatId: string,
    senderId: string,
    content: string
  ): Promise<IMessage> {
    try {
      const message = await this._model.create({
        chatId,
        senderId,
        content,
        sentAt: new Date(),
        isRead: false,
      });
      return message;
    } catch (error) {
      console.error('Error in ChatRepository.createMessage:', error);
      throw new Error('Could not send message');
    }
  }

  async countUnreadMessages(chatId: string, userId: string): Promise<number> {
    try {
      return await this._model.countDocuments({
        chatId,
        'readBy.userId': { $ne: userId },
        senderId: { $ne: userId },
      });
    } catch (error) {
      console.error('Error in MessageRepository.countUnreadMessages:', error);
      throw new Error('Could not count unread messages');
    }
  }

  async markMessagesAsRead(chatId: string, userId: string): Promise<{ modifiedCount: number }> {
    try {
      const result = await this._model.updateMany(
        {
          chatId,
          'readBy.userId': { $ne: userId },
          senderId: { $ne: userId },
        },
        { $push: { readBy: { userId, readAt: new Date() } } }
      );
      return { modifiedCount: result.modifiedCount };
    } catch (error) {
      console.error('Error in MessageRepository.markMessagesAsRead:', error);
      throw new Error('Could not mark messages as read');
    }
  }

  async getLastMessage(chatId: string): Promise<IMessage | null> {
    try {
      return await this._model
        .findOne({ chatId })
        .sort({ sentAt: -1 })
        .select('content media sentAt senderId readBy')
        .populate('senderId', 'name')
        .lean()
        .exec();
    } catch (error) {
      console.error('Error in MessageRepository.getLastMessage:', error);
      throw new Error('Could not fetch last message');
    }
  }

  

}

export default  MessageRepository;