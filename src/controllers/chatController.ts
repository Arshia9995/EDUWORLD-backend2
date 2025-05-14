import { AuthRequest } from "../middleware/authMiddleware";
import { Response } from "express";
import { Status } from "../utils/enums";
import { ChatService } from "../services/chatService";
import { MessageService } from "../services/messageService";

class ChatController {
    constructor(
        private _chatService: ChatService,
        private _messageService: MessageService
    ) {}

    getChatByCourseId = async (req: AuthRequest, res: Response) => {
        try {
          if (!req.user?.id) {
            return res.status(Status.UN_AUTHORISED).json({
              success: false,
              message: "Unauthorized: User ID not found",
            });
          }
      
          const { courseId } = req.params;
      
          if (!courseId) {
            return res.status(Status.BAD_REQUEST).json({
              success: false,
              message: "Course ID is required",
            });
          }
      
          const result = await this._chatService.getChatByCourseId(courseId, req.user.id);
          if (!result.success) {
            return res.status(Status.NOT_FOUND).json({
              success: false,
              message: result.message,
            });
          }
      
          return res.status(Status.OK).json({
            success: true,
            message: result.message,
            chat: result.data.chat,
            unreadCount: result.data.unreadCount,
          });
        } catch (error: any) {
          console.error("Error in getChatByCourseId controller:", error);
          const status = error.message === "Chat not found for this course" ? Status.NOT_FOUND : Status.BAD_REQUEST;
          return res.status(status).json({
            success: false,
            message: error.message || "Failed to fetch chat",
          });
        }
      };


    getMessagesByChatId = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user?.id) {
                return res.status(Status.UN_AUTHORISED).json({
                    success: false,
                    message: "Unauthorized: User ID not found",
                });
            }

            const { chatId } = req.params;

            if (!chatId) {
                return res.status(Status.BAD_REQUEST).json({
                    success: false,
                    message: "Chat ID is required",
                });
            }

            const messages = await this._messageService.getMessagesByChatId(chatId);

            return res.status(Status.OK).json({
                success: true,
                message: "Messages retrieved successfully",
                messages,
            });
        } catch (error: any) {
            console.error("Error in getMessagesByChatId controller:", error);
            return res.status(Status.INTERNAL_SERVER_ERROR).json({
                success: false,
                message: error.message || "Failed to fetch messages",
            });
        }
    };

    createMessage = async (req: AuthRequest, res: Response) => {
        try {
            if (!req.user?.id) {
                return res.status(Status.UN_AUTHORISED).json({
                    success: false,
                    message: "Unauthorized: User ID not found",
                });
            }
            const senderId = req.user?.id
            const { chatId } = req.params;
            const { content, media } = req.body;

            if (!chatId  || !senderId) {
                return res.status(Status.BAD_REQUEST).json({
                    success: false,
                    message: "Chat ID, content, and senderId are required",
                });
            }

            if (media) {
                if (!media.url || !media.type || !['image', 'video', 'file'].includes(media.type)) {
                    return res.status(Status.BAD_REQUEST).json({
                        success: false,
                        message: "Invalid media format: url and valid type (image, video, file) are required",
                    });
                }
            }
            // Verify chat exists
            await this._chatService.getChatById(chatId);

            const messages = await this._messageService.createMessage(chatId, senderId, content, media);

            return res.status(Status.CREATED).json({
                success: true,
                message: "Message created successfully",
                messages,
            });
        } catch (error: any) {
            console.error("Error in createMessage controller:", error);
            const status = error.message === "Chat not found" ? Status.NOT_FOUND : Status.BAD_REQUEST;
            return res.status(status).json({
                success: false,
                message: error.message || "Failed to create message",
            });
        }
    };


    //''''''''''''''''''''''''''''''''''

//     async getInstructorChats(req: AuthRequest, res: Response) {
//         try {
//           if (!req.user?.id) {
//             return res.status(Status.UN_AUTHORISED).json({
//               success: false,
//               message: "Unauthorized: Instructor ID not found",
//             });
//           }
    
//           const result = await this._chatService.getInstructorChats(req.user.id);
//           if (!result.success) {
//             return res.status(Status.BAD_REQUEST).json({
//               success: false,
//               message: result.message,
//             });
//           }
    
//           return res.status(Status.OK).json({
//             success: true,
//             message: result.message,
//             data: result.data,
//           });
//         } catch (error: any) {
//           console.error("Error in getInstructorChats controller:", error);
//           return res.status(Status.INTERNAL_SERVER_ERROR).json({
//             success: false,
//             message: "Internal server error",
//           });
//         }
//       }
    
     
//      // New method: Get chat by course ID
//   async getinstructorChatByCourseId(req: AuthRequest, res: Response) {
//     try {
//       if (!req.user?.id) {
//         return res.status(Status.UN_AUTHORISED).json({
//           success: false,
//           message: "Unauthorized: User ID not found",
//         });
//       }

//       const { courseId } = req.params;

//       if (!courseId) {
//         return res.status(Status.BAD_REQUEST).json({
//           success: false,
//           message: "Course ID is required",
//         });
//       }

//       const chat = await this._chatService.getinstructorChatByCourseId(courseId);
//       return res.status(Status.OK).json({
//         success: true,
//         message: "Chat retrieved successfully",
//         chat,
//       });
//     } catch (error: any) {
//       console.error("Error in ChatController.getChatByCourseId:", error);
//       const status = error.message === "Chat not found for this course" ? Status.NOT_FOUND : Status.BAD_REQUEST;
//       return res.status(status).json({
//         success: false,
//         message: error.message || "Failed to fetch chat",
//       });
//     }
//   }

//   // New method: Get messages by chat ID
//   async getinstructorMessagesByChatId(req: AuthRequest, res: Response) {
//     try {
//       if (!req.user?.id) {
//         return res.status(Status.UN_AUTHORISED).json({
//           success: false,
//           message: "Unauthorized: User ID not found",
//         });
//       }

//       const { chatId } = req.params;

//       if (!chatId) {
//         return res.status(Status.BAD_REQUEST).json({
//           success: false,
//           message: "Chat ID is required",
//         });
//       }

//       const messages = await this._chatService.getinstructorMessagesByChatId(chatId);
//       return res.status(Status.OK).json({
//         success: true,
//         message: "Messages retrieved successfully",
//         messages,
//       });
//     } catch (error: any) {
//       console.error("Error in ChatController.getMessagesByChatId:", error);
//       return res.status(Status.INTERNAL_SERVER_ERROR).json({
//         success: false,
//         message: error.message || "Failed to fetch messages",
//       });
//     }
//   }

//   // New method: Create a new message
//   async instructorCreateMessage(req: AuthRequest, res: Response) {
//     try {
//       if (!req.user?.id) {
//         return res.status(Status.UN_AUTHORISED).json({
//           success: false,
//           message: "Unauthorized: User ID not found",
//         });
//       }

//       const senderId = req.user.id;
//       const { chatId } = req.params;
//       const { content } = req.body;

//       if (!chatId || !content || !senderId) {
//         return res.status(Status.BAD_REQUEST).json({
//           success: false,
//           message: "Chat ID, content, and senderId are required",
//         });
//       }

//       // Verify chat exists
//       await this._chatService.getinstructorChatById(chatId);

//       const messages = await this._chatService.instructorCreateMessage(chatId, senderId, content);
//       return res.status(Status.CREATED).json({
//         success: true,
//         message: "Message created successfully",
//         messages,
//       });
//     } catch (error: any) {
//       console.error("Error in ChatController.createMessage:", error);
//       const status = error.message === "Chat not found" ? Status.NOT_FOUND : Status.BAD_REQUEST;
//       return res.status(status).json({
//         success: false,
//         message: error.message || "Failed to create message",
//       });
//     }
//   }



//..........................



async getInstructorChats(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id || req.user.role !== 'instructor') {
        return res.status(Status.UN_AUTHORISED).json({
          success: false,
          message: 'Unauthorized: Only instructors can access chats',
        });
      }

      const result = await this._chatService.getInstructorChats(req.user.id);

      if (!result.success) {
        return res.status(Status.BAD_REQUEST).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(Status.OK).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error: any) {
      console.error('Error in ChatController.getInstructorChats:', error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async getMessages(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id || req.user.role !== 'instructor') {
        return res.status(Status.UN_AUTHORISED).json({
          success: false,
          message: 'Unauthorized: Only instructors can access messages',
        });
      }

      const { chatId } = req.params;

      if (!chatId) {
        return res.status(Status.BAD_REQUEST).json({
          success: false,
          message: 'Chat ID is required',
        });
      }

      const result = await this._messageService.getMessages(chatId);

      if (!result.success) {
        return res.status(Status.BAD_REQUEST).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(Status.OK).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error: any) {
      console.error('Error in ChatController.getMessages:', error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }

  async sendMessage(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id || req.user.role !== 'instructor') {
        return res.status(Status.UN_AUTHORISED).json({
          success: false,
          message: 'Unauthorized: Only instructors can send messages',
        });
      }

      const { chatId, content } = req.body;

      if (!chatId || !content) {
        return res.status(Status.BAD_REQUEST).json({
          success: false,
          message: 'Chat ID and content are required',
        });
      }

      const result = await this._messageService.sendMessage(
        chatId,
        req.user.id,
        content
      );

      if (!result.success) {
        return res.status(Status.BAD_REQUEST).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(Status.OK).json({
        success: true,
        message: result.message,
        data: result.data,
      });
    } catch (error: any) {
      console.error('Error in ChatController.sendMessage:', error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
  
    
  async markMessagesAsRead(req: AuthRequest, res: Response) {
    try {
      if (!req.user?.id || !['instructor', 'student'].includes(req.user.role)) {
        return res.status(Status.UN_AUTHORISED).json({
          success: false,
          message: 'Unauthorized: Only instructors or students can mark messages as read',
        });
      }

      const { chatId } = req.params;

      if (!chatId) {
        return res.status(Status.BAD_REQUEST).json({
          success: false,
          message: 'Chat ID is required',
        });
      }

      const result = await this._messageService.markMessagesAsRead(chatId, req.user.id);

      if (!result.success) {
        return res.status(Status.BAD_REQUEST).json({
          success: false,
          message: result.message,
        });
      }

      return res.status(Status.OK).json({
        success: true,
        message: result.message,
      });
    } catch (error: any) {
      console.error('Error in ChatController.markMessagesAsRead:', error);
      return res.status(Status.INTERNAL_SERVER_ERROR).json({
        success: false,
        message: 'Internal server error',
      });
    }
  }
      
    
      
    
      
}

export default ChatController;