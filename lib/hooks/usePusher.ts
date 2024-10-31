import { useEffect, useCallback } from 'react';
import { pusherClient } from '@/lib/pusher';
import { useAuth } from '@/lib/auth';

export function usePusher(conversationId?: string) {
  const { user } = useAuth();

  useEffect(() => {
    if (!conversationId) return;

    // Subscribe to the conversation channel
    const channel = pusherClient.subscribe(`conversation-${conversationId}`);

    return () => {
      pusherClient.unsubscribe(`conversation-${conversationId}`);
    };
  }, [conversationId]);

  const sendMessage = useCallback(async (message: any) => {
    try {
      await fetch('/api/messages', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(message),
      });
    } catch (error) {
      console.error('Error sending message:', error);
      throw error;
    }
  }, []);

  const onNewMessage = useCallback((callback: (message: any) => void) => {
    if (!conversationId) return;

    const channel = pusherClient.subscribe(`conversation-${conversationId}`);
    channel.bind('new-message', callback);

    return () => {
      channel.unbind('new-message', callback);
    };
  }, [conversationId]);

  const sendTypingStatus = useCallback(async (isTyping: boolean) => {
    if (!conversationId || !user) return;

    try {
      await fetch('/api/typing', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          conversationId,
          userId: user.id,
          isTyping,
        }),
      });
    } catch (error) {
      console.error('Error sending typing status:', error);
    }
  }, [conversationId, user]);

  const onTypingStatus = useCallback((callback: (data: { userId: string; isTyping: boolean }) => void) => {
    if (!conversationId) return;

    const channel = pusherClient.subscribe(`conversation-${conversationId}`);
    channel.bind('typing-status', callback);

    return () => {
      channel.unbind('typing-status', callback);
    };
  }, [conversationId]);

  return {
    sendMessage,
    onNewMessage,
    sendTypingStatus,
    onTypingStatus,
  };
} 