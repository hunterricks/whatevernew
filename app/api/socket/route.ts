import { Server } from 'socket.io';
import { NextApiResponseServerIO } from '@/types/socket';
import { NextResponse } from 'next/server';

const ioHandler = (req: Request, res: NextApiResponseServerIO) => {
  if (!res.socket.server.io) {
    const io = new Server(res.socket.server, {
      path: '/api/socket',
      addTrailingSlash: false,
      cors: {
        origin: process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000',
        methods: ['GET', 'POST'],
      },
    });

    io.on('connection', (socket) => {
      console.log('Client connected:', socket.id);

      socket.on('join-conversation', (conversationId: string) => {
        socket.join(conversationId);
        console.log(`Socket ${socket.id} joined room ${conversationId}`);
      });

      socket.on('leave-conversation', (conversationId: string) => {
        socket.leave(conversationId);
        console.log(`Socket ${socket.id} left room ${conversationId}`);
      });

      socket.on('send-message', (data) => {
        io.to(data.conversationId).emit('new-message', data);
      });

      socket.on('typing', (data) => {
        socket.to(data.conversationId).emit('user-typing', {
          userId: data.userId,
          isTyping: data.isTyping,
        });
      });

      socket.on('disconnect', () => {
        console.log('Client disconnected:', socket.id);
      });
    });

    res.socket.server.io = io;
  }

  return NextResponse.json({ success: true });
};

export { ioHandler as GET, ioHandler as POST };