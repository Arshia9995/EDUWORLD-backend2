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

     
    
    //   async instructorgetChatById(chatId: string): Promise<IChat | null> {
    //     try {
    //       const chat = await this._chatRepository.findById(chatId);
    //       if (!chat) {
    //         throw new Error('Chat not found');
    //       }
    //       return chat;
    //     } catch (error: any) {
    //       throw new Error(`Failed to fetch chat: ${error.message}`);
    //     }
    //   }

    //''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''''


//     async getInstructorChats(instructorId: string): Promise<{
//         success: boolean;
//         message: string;
//         data: (IChat & { course: ICourse })[] | null;
//       }> {
//         try {
//           // Get courses for the instructor
//           const courses = await this._courseRepository.findByInstructor(instructorId);
    
//           if (!courses || courses.length === 0) {
//             return {
//               success: true,
//               message: "No courses found for this instructor",
//               data: [],
//             };
//           }
    
//           // Get course IDs (convert ObjectId to string)
//           const courseIds = courses.map((course) => course._id.toString());
    
//           // Get chats for these courses
//           const chats = await this._chatRepository.findByCourseIds(courseIds);
    
//           // Map chats with their corresponding courses
//           const chatsWithCourses = chats.map((chat) => {
//             const course = courses.find((c) => c._id.toString() === chat.courseId.toString());
//             return {
//               ...chat,
//               course: course || { _id: chat.courseId, title: "Unknown Course" }, // Fallback if course not found
//             } as IChat & { course: ICourse };
//           });
    
//           return {
//             success: true,
//             message: "Chats fetched successfully",
//             data: chatsWithCourses,
//           };
//         } catch (error: any) {
//           return {
//             success: false,
//             message: error.message || "Failed to fetch chats",
//             data: null,
//           };
//         }
//       }
    
//       // New method: Get chat by course ID
//   async getinstructorChatByCourseId(courseId: string): Promise<IChat | null> {
//     try {
//       const chat = await this._chatRepository.findByCourseId(courseId);
//       if (!chat) {
//         throw new Error("Chat not found for this course");
//       }
//       return chat;
//     } catch (error: any) {
//       throw new Error(`Failed to fetch chat: ${error.message}`);
//     }
//   }

//   // New method: Get chat by ID
//   async getinstructorChatById(chatId: string): Promise<IChat | null> {
//     try {
//       const chat = await this._chatRepository.findById(chatId);
//       if (!chat) {
//         throw new Error("Chat not found");
//       }
//       return chat;
//     } catch (error: any) {
//       throw new Error(`Failed to fetch chat: ${error.message}`);
//     }
//   }

//   // New method: Get messages by chat ID
//   async getinstructorMessagesByChatId(chatId: string): Promise<IMessage[]> {
//     try {
//       const messages = await this._chatRepository.getInstructorChatMessages(chatId);
//       return messages;
//     } catch (error: any) {
//       throw new Error(`Failed to fetch messages: ${error.message}`);
//     }
//   }

//   // New method: Create a new message
//   async instructorCreateMessage(chatId: string, senderId: string, content: string): Promise<IMessage> {
//     try {
//       const message = await this._chatRepository.instructorSendMessage(chatId, senderId, content);
//       return message;
//     } catch (error: any) {
//       throw new Error(`Failed to create message: ${error.message}`);
//     }
//   }
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
