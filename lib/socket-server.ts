import { Server as NetServer } from 'http';
import { Server as SocketIOServer } from 'socket.io';
import { NextApiResponse } from 'next';
import { createServer } from 'http';

export type NextApiResponseServerIO = NextApiResponse & {
  socket: {
    server: NetServer & {
      io: SocketIOServer;
    };
  };
};

let io: SocketIOServer;

export function getSocketIO() {
  if (!io) {
    const httpServer = createServer();
    io = new SocketIOServer(httpServer, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: '*',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-conversation', (conversationId: string) => {
        socket.join(`conversation-${conversationId}`);
        console.log(`Socket ${socket.id} joined conversation ${conversationId}`);
      });

      socket.on('leave-conversation', (conversationId: string) => {
        socket.leave(`conversation-${conversationId}`);
        console.log(`Socket ${socket.id} left conversation ${conversationId}`);
      });

      socket.on('send-message', (data) => {
        io.to(`conversation-${data.conversationId}`).emit('new-message', data);
      });

      socket.on('typing', (data) => {
        socket.to(`conversation-${data.conversationId}`).emit('user-typing', {
          userId: data.userId,
          isTyping: data.isTyping,
        });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    httpServer.listen(3001);
  }
  return io;
} 