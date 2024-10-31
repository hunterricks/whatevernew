import { useEffect, useRef, useCallback } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from '@/lib/auth';

export function useSocket(conversationId?: string) {
  const { user } = useAuth();
  const socketRef = useRef<Socket>();
  const typingTimeoutRef = useRef<NodeJS.Timeout>();

  useEffect(() => {
    socketRef.current = io('http://localhost:3001', {
      path: '/api/socket',
    });

    return () => {
      if (socketRef.current) {
        socketRef.current.disconnect();
      }
    };
  }, []);

  useEffect(() => {
    if (conversationId && socketRef.current) {
      socketRef.current.emit('join-conversation', conversationId);

      return () => {
        socketRef.current?.emit('leave-conversation', conversationId);
      };
    }
  }, [conversationId]);

  const sendMessage = useCallback((message: any) => {
    if (socketRef.current) {
      socketRef.current.emit('send-message', {
        ...message,
        conversationId,
      });
    }
  }, [conversationId]);

  const onNewMessage = useCallback((callback: (message: any) => void) => {
    if (socketRef.current) {
      socketRef.current.on('new-message', callback);
    }
    return () => {
      socketRef.current?.off('new-message', callback);
    };
  }, []);

  const sendTypingStatus = useCallback((isTyping: boolean) => {
    if (socketRef.current && user) {
      socketRef.current.emit('typing', {
        conversationId,
        userId: user.id,
        isTyping,
      });
    }
  }, [conversationId, user]);

  const onTypingStatus = useCallback((callback: (data: { userId: string; isTyping: boolean }) => void) => {
    if (socketRef.current) {
      socketRef.current.on('user-typing', callback);
    }
    return () => {
      socketRef.current?.off('user-typing', callback);
    };
  }, []);

  return {
    sendMessage,
    onNewMessage,
    sendTypingStatus,
    onTypingStatus,
    isConnected: socketRef.current?.connected || false,
  };
} 