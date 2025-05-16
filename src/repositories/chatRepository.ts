import mongoose from "mongoose";
import { IChat } from "../interfaces/IChat";
import { Chat } from "../models/chatModel";
import { BaseRepository } from "./baseRepository";
import { ICourse } from "../interfaces/ICourse";
import { IMessage } from "../interfaces/IMessage";
import { Message } from "../models/messageModel";
import { courseModel } from "../models/courseModel";


class ChatRepository extends BaseRepository<IChat>{
    private _courseModel = courseModel;
    private _messageModel = Message;

    constructor() {
        super(Chat)
        
    }


    async createChatRoom(courseId: string, instructorId: string): Promise<IChat> {
        try {
          const chatRoom = await this._model.create({
            courseId,
            instructorId,
            participants: [instructorId],
          });
          return chatRoom;
        } catch (error) {
          console.error("Error in ChatRepository.createChatRoom:", error);
          throw new Error("Could not create chat room");
        }
      }
    
      async addParticipant(courseId: string, userId: string): Promise<IChat | null> {
        try {
          const chatRoom = await this._model
            .findOneAndUpdate(
              { courseId },
              { $addToSet: { participants: userId } },
              { new: true }
            )
            .lean();
          return chatRoom;
        } catch (error) {
          console.error("Error in ChatRepository.addParticipant:", error);
          throw new Error("Could not add participant to chat room");
        }
      }
    
      async findByCourseId(courseId: string): Promise<IChat | null> {
        try {
          return await this._model
            .findOne({ courseId })
            .populate("participants", "name")
            .populate("instructorId", "name")
            .lean();
        } catch (error) {
          console.error("Error in ChatRepository.findByCourseId:", error);
          throw new Error("Could not find chat room");
        }
      }

      async findById(chatId: string): Promise<IChat | null> {
        return await Chat.findById(chatId).populate('participants', 'name role');
      }

      

async getInstructorChats(instructorId: string): Promise<IChat[]> {
    try {
      return await this._model
        .find({ instructorId })
        .populate({
          path: 'courseId',
          select: 'title',
        })
        .populate({
            path: 'participants',
            select: 'name',
          })
        .lean()
        .exec();
        
        
    } catch (error) {
      console.error('Error in ChatRepository.getInstructorChats:', error);
      throw new Error('Could not fetch instructor chats');
    }
  }

  
}

export default ChatRepository;