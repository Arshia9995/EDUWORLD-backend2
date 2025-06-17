import { Server, Socket } from 'socket.io';
import http from 'http';
import { IMessage } from '../interfaces/IMessage';
import { Chat } from '../models/chatModel';
const socket = require("socket.io");

interface ServerToClientEvents {
  message: (message: IMessage) => void;
  error: (error: { message: string }) => void;
}

interface ClientToServerEvents {
  sendMessage: (data: { chatId: string; content: string }) => void;
  joinRoom: (chatId: string) => void;
  newMessage: (data: IMessage) => void; 
  leaveRoom: (chatId: string) => void;
}

interface SocketData {
  userId: string;
}

const initializeSocket = (server: http.Server) => {
  const io = socket(server, {
    cors: {
      origin: process.env.frontEnd_URL || 'https://eduworld.space' ,
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });


  io.on('connection', (socket: Socket<ClientToServerEvents, ServerToClientEvents, any, SocketData>) => {
    console.log(`User connected: ${socket.id}`);

    const userId = socket.handshake.auth.userId;
    if (!userId) {
      socket.emit('error', { message: 'Authentication required' });
      socket.disconnect();
      return;
    }
    socket.data.userId = userId;

    socket.on('joinRoom', async (chatId: string) => {
      try {
        const chat = await Chat.findById(chatId).populate('participants');
        if (!chat) {
          socket.emit('error', { message: 'Chat room not found' });
          return;
        }

        const isParticipant = chat.participants.some(
          (participant: any) => participant._id.toString() === userId
        );
        if (!isParticipant) {
          socket.emit('error', { message: 'Unauthorized: Not a participant' });
          return;
        }

        socket.join(chatId);
        console.log(`User ${userId} joined chat ${chatId}`);
      } catch (error: any) {
        socket.emit('error', { message: 'Failed to join chat' });
      }
    });

    socket.on('leaveRoom', (chatId: string) => {
      socket.leave(chatId);
      console.log(`User ${userId} left chat ${chatId}`);
    });

    socket.on('newMessage', async (message: IMessage) => {
        try {
          
          const chatId = message.chatId.toString();
      
          const chat = await Chat.findById(chatId);
          if (!chat) {
            socket.emit('error', { message: 'Chat room not found' });
            return;
          }
      
          const isParticipant = chat.participants.some(
            (participant: any) => participant._id.toString() === userId
          );
          if (!isParticipant) {
            socket.emit('error', { message: 'Unauthorized: Not a participant' });
            return;
          }
      
          
          socket.to(chatId).emit('message', message);
      
          console.log(`Broadcasted message to chat ${chatId} (excluding sender):`, message);
        } catch (error: any) {
          socket.emit('error', { message: 'Failed to broadcast message' });
        }
      });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export default initializeSocket;