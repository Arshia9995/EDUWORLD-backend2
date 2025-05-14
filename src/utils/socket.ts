import { Server, Socket } from 'socket.io';
import http from 'http';
import { IMessage } from '../interfaces/IMessage';
import { Message } from '../models/messageModel';
import { Chat } from '../models/chatModel';
const socket = require("socket.io");

interface ServerToClientEvents {
  message: (message: IMessage) => void;
  error: (error: { message: string }) => void;
}

interface ClientToServerEvents {
  sendMessage: (data: { chatId: string; content: string }) => void;
  joinChat: (chatId: string) => void;
}

interface SocketData {
  userId: string;
}

const initializeSocket = (server: http.Server) => {
  const io =  socket  (server, {
    cors: {
      origin: process.env.frontEnd_URL || 'http://localhost:5173',
      methods: ['GET', 'POST'],
      credentials: true,
    },
  });

  io.on('connection', (socket: Socket) => {
    console.log(`User connected: ${socket.id}`);

    // Authenticate user (e.g., using token from handshake)
    const userId = socket.handshake.auth.userId;
    if (!userId) {
      socket.emit('error', { message: 'Authentication required' });
      socket.disconnect();
      return;
    }
    socket.data.userId = userId;

    // Join a chat room
    socket.on('joinRoom', async (chatId: string) => {
      try {
        console.log("reacheddddd inside joinroom");
        
        const chat = await Chat.findById(chatId).populate('participants');
        if (!chat) {
          socket.emit('error', { message: 'Chat room not found' });
          return;
        }

        // Verify user is a participant
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

    // Handle sending messages
    socket.on('newMessage', async (data) => {
      try {
        const { chatId, content } = data;

        // Validate chat exists
        const chat = await Chat.findById(chatId);
        if (!chat) {
          socket.emit('error', { message: 'Chat room not found' });
          return;
        }

        // Verify sender is a participant
        const isParticipant = chat.participants.some(
          (participant: any) => participant._id.toString() === userId
        );
        if (!isParticipant) {
          socket.emit('error', { message: 'Unauthorized: Not a participant' });
          return;
        }

        // Create and save message
        const message = new Message({
          chatId,
          senderId: userId,
          content,
          sentAt: new Date(),
          isRead: false,
        });
        await message.save();

        // Populate sender details for client
        const populatedMessage = await Message.findById(message._id)
          .populate('senderId', 'name email')
          .lean();

        // Broadcast message to all participants in the chat room
        io.to(chatId).emit('message', populatedMessage as IMessage);
      } catch (error: any) {
        socket.emit('error', { message: 'Failed to send message' });
      }
    });

    socket.on('disconnect', () => {
      console.log(`User disconnected: ${socket.id}`);
    });
  });

  return io;
};

export default initializeSocket;