import { IMessage } from "../interfaces/IMessage";
import MessageRepository from "../repositories/messageRepository";
import { IMessageService } from "../interfaces/IServices";


export class MessageService implements IMessageService {
    constructor (
        private _messageRepository: MessageRepository
    ){
        this._messageRepository = _messageRepository;
    }

    async getMessagesByChatId(chatId: string): Promise<IMessage[]> {
        try {
          const messages = await this._messageRepository.findByChatId(chatId);
          return messages;
        } catch (error:any) {
          throw new Error(`Failed to fetch messages: ${error.message}`);
        }
      }
    
      async createMessage(
        chatId: string,
        senderId: string,
        content: string,
        media?: { url: string; type: 'image' | 'video' | 'file' }
      ): Promise<IMessage> {
        try {
          const message = await this._messageRepository.createMessage(
            chatId,
            senderId,
            content,
            media
          );
          return message;
        } catch (error: any) {
          throw new Error(`Failed to create message: ${error.message}`);
        }
      }

 //..............................................

 async getMessages(chatId: string): Promise<{
    success: boolean;
    message: string;
    data: IMessage[] | null;
  }> {
    try {
      const messages = await this._messageRepository.getMessages(chatId);
      return {
        success: true,
        message: 'Messages fetched successfully',
        data: messages,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to fetch messages',
        data: null,
      };
    }
  }

  async sendMessage(
    chatId: string,
    senderId: string,
    content: string
  ): Promise<{
    success: boolean;
    message: string;
    data: IMessage | null;
  }> {
    try {
      const message = await this._messageRepository.instructorCreateMessage(
        chatId,
        senderId,
        content
      );
      return {
        success: true,
        message: 'Message sent successfully',
        data: message,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to send message',
        data: null,
      };
    }
  }

   
  async markMessagesAsRead(chatId: string, userId: string): Promise<{
    success: boolean;
    message: string;
  }> {
    try {
      const { modifiedCount } = await this._messageRepository.markMessagesAsRead(chatId, userId);
      return {
        success: true,
        message: `Marked ${modifiedCount} messages as read for user`,
      };
    } catch (error: any) {
      return {
        success: false,
        message: error.message || 'Failed to mark messages as read',
      };
    }
  }

}