"use client";

import { use } from 'react';
import { useEffect, useState, useRef } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Send, MoreVertical, ArrowLeft, Paperclip } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useSocket } from '@/lib/hooks/useSocket';

interface Message {
  id: string;
  content: string;
  senderId: string;
  createdAt: string;
  attachments?: { name: string; url: string; }[];
}

interface Conversation {
  id: string;
  jobTitle: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
  };
}

export default function ConversationPage({ params }: { params: Promise<{ conversationId: string }> }) {
  const resolvedParams = use(params);
  const { user, checkAuth } = useAuth();
  const router = useRouter();
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [newMessage, setNewMessage] = useState("");
  const [isLoading, setIsLoading] = useState(true);
  const [isOtherUserTyping, setIsOtherUserTyping] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout>();
  const { sendMessage, onNewMessage, sendTypingStatus, onTypingStatus, isConnected } = useSocket(resolvedParams.conversationId);

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/login');
      return;
    }

    fetchConversation();
    fetchMessages();
  }, [resolvedParams.conversationId]);

  useEffect(() => {
    const unsubscribe = onNewMessage((message) => {
      setMessages(prev => [...prev, message]);
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    });

    return () => unsubscribe();
  }, [onNewMessage]);

  useEffect(() => {
    const unsubscribe = onTypingStatus(({ userId, isTyping }) => {
      if (userId !== user?.id) {
        setIsOtherUserTyping(isTyping);
      }
    });

    return () => unsubscribe();
  }, [onTypingStatus, user?.id]);

  const fetchConversation = async () => {
    // Mock data - replace with API call
    setConversation({
      id: resolvedParams.conversationId,
      jobTitle: "Website Development Project",
      otherUser: {
        id: "user1",
        name: "John Client",
        isOnline: true,
      },
    });
  };

  const fetchMessages = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with API call
      const mockMessages: Message[] = [
        {
          id: "1",
          content: "Hi, I've reviewed your proposal",
          senderId: "user1",
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
        {
          id: "2",
          content: "Thank you for reviewing. I'm happy to discuss any questions you might have.",
          senderId: user?.id || "",
          createdAt: new Date(Date.now() - 85400000).toISOString(),
        },
      ];
      
      setMessages(mockMessages);
    } catch (error) {
      console.error('Error fetching messages:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  const handleSendMessage = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newMessage.trim() || !user) return;

    try {
      const message = {
        id: Date.now().toString(),
        content: newMessage,
        senderId: user.id,
        senderName: user.name,
        createdAt: new Date().toISOString(),
      };

      sendMessage(message);
      setNewMessage("");
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message');
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewMessage(e.target.value);
    sendTypingStatus(true);
    
    // Clear typing status after 2 seconds of no typing
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    
    typingTimeoutRef.current = setTimeout(() => {
      sendTypingStatus(false);
    }, 2000);
  };

  if (!user || !conversation) return null;

  return (
    <div className="container mx-auto px-4 py-8 mt-16 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Mobile back button */}
        <div className="md:hidden">
          <Button variant="ghost" onClick={() => router.back()}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Back to messages
          </Button>
        </div>

        {/* Messages list (hidden on mobile) */}
        <div className="hidden md:block md:col-span-1">
          {/* This will be shown on desktop, reuse the list from messages/page.tsx */}
        </div>

        {/* Conversation */}
        <div className="md:col-span-2 border rounded-lg flex flex-col h-[calc(100vh-12rem)]">
          {/* Conversation Header */}
          <div className="p-4 border-b flex items-center justify-between">
            <div className="flex items-center gap-3">
              <Avatar className="h-10 w-10">
                <AvatarImage src={conversation.otherUser.avatar} />
                <AvatarFallback>
                  {conversation.otherUser.name.split(' ').map(n => n[0]).join('')}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="font-medium">{conversation.otherUser.name}</h2>
                <p className="text-sm text-muted-foreground">{conversation.jobTitle}</p>
              </div>
            </div>
            <DropdownMenu>
              <DropdownMenuTrigger asChild>
                <Button variant="ghost" size="icon">
                  <MoreVertical className="h-4 w-4" />
                </Button>
              </DropdownMenuTrigger>
              <DropdownMenuContent align="end">
                <DropdownMenuItem>View contract</DropdownMenuItem>
                <DropdownMenuItem>Archive conversation</DropdownMenuItem>
                <DropdownMenuItem className="text-destructive">Report issue</DropdownMenuItem>
              </DropdownMenuContent>
            </DropdownMenu>
          </div>

          {/* Messages */}
          <div className="flex-1 overflow-y-auto p-4 space-y-4">
            {messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.senderId === user.id ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[70%] rounded-lg p-3 ${
                    message.senderId === user.id
                      ? 'bg-primary text-primary-foreground ml-12'
                      : 'bg-muted mr-12'
                  }`}
                >
                  {message.content}
                  <div className="text-xs mt-1 opacity-70">
                    {new Date(message.createdAt).toLocaleTimeString()}
                  </div>
                </div>
              </div>
            ))}
            {isOtherUserTyping && (
              <div className="flex justify-start">
                <div className="bg-muted rounded-lg p-3">
                  <div className="flex space-x-2">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-100" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-bounce delay-200" />
                  </div>
                </div>
              </div>
            )}
            <div ref={messagesEndRef} />
          </div>

          {/* Message Input */}
          <form onSubmit={handleSendMessage} className="p-4 border-t">
            <div className="flex gap-2">
              <Button type="button" variant="ghost" size="icon">
                <Paperclip className="h-4 w-4" />
              </Button>
              <Input
                value={newMessage}
                onChange={handleInputChange}
                placeholder="Type a message..."
                className="flex-1"
              />
              <Button type="submit" size="icon">
                <Send className="h-4 w-4" />
              </Button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
 