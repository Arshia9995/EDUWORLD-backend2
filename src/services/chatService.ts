import { IChat } from "../interfaces/IChat";
import ChatRepository from "../repositories/chatRepository";
import { IChatService } from "../interfaces/IServices";
import { IMessage } from "../interfaces/IMessage";
import { ICourse } from "../interfaces/ICourse";
import CourseRepository from "../repositories/courseRepository";
import { Message } from "../models/messageModel";
import MessageRepository from "../repositories/messageRepository";


export class ChatService implements IChatService {
    constructor (
        private _chatRepository: ChatRepository,
        private _courseRepository: CourseRepository,
        private _messageRepository: MessageRepository
    ){
        this._chatRepository = _chatRepository;
        this._courseRepository = _courseRepository;
        this._messageRepository = _messageRepository;
    }


    async getChatByCourseId(courseId: string, userId: string): Promise<{
        success: boolean;
        message: string;
        data: { chat: IChat | null; unreadCount: number };
      }> {
        try {
          const chat = await this._chatRepository.findByCourseId(courseId);
          if (!chat) {
            return {
              success: false,
              message: "Chat not found for this course",
              data: { chat: null, unreadCount: 0 },
            };
          }
          const chatId = chat._id ? chat._id.toString() : '';
          const unreadCount = await this._messageRepository.countUnreadMessages(chatId, userId);
          return {
            success: true,
            message: "Chat fetched successfully",
            data: { chat, unreadCount },
          };
        } catch (error: any) {
          throw new Error(`Failed to fetch chat: ${error.message}`);
        }
      }
    
      async getChatById(chatId: string): Promise<IChat | null> {
        try {
          const chat = await this._chatRepository.findById(chatId);
          if (!chat) {
            throw new Error("Chat not found");
          }
          return chat;
        } catch (error: any) {
          throw new Error(`Failed to fetch chat: ${error.message}`);
        }
      }

     
    
   
    //.................................................................

    async getInstructorChats(instructorId: string): Promise<{
        success: boolean;
        message: string;
        data: any[] | null;
      }> {
        try {
            const chats = await this._chatRepository.getInstructorChats(instructorId.toString());
    
          console.log('chattttttttttttttttt', chats);
    
          const chatsWithDetails = await Promise.all(
            chats.map(async (chat) => {

                const chatId = chat._id ? chat._id.toString() : '';

              const lastMessage = await this._messageRepository.getLastMessage(chatId);
              const unreadCount = await this._messageRepository.countUnreadMessages(chatId, instructorId);
              return {
                ...chat,
                lastMessage,
                unreadCount,
              };
            })
          );
    
          return {
            success: true,
            message: 'Chats fetched successfully',
            data: chatsWithDetails,
          };
        } catch (error: any) {
          return {
            success: false,
            message: error.message || 'Failed to fetch chats',
            data: null,
          };
        }
      }
    
     
}
