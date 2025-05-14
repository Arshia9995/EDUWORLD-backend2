export interface ISocketMessage {
    chatId: string;
    senderId: string;
    content: string;
    media?: {
      url: string;
      type: 'image' | 'video' | 'file';
    };
    sentAt: Date;
    isRead: boolean;
  }
  
  export interface ISocketJoinChat {
    chatId: string;
    userId: string;
  }