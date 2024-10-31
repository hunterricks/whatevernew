"use client";

import { useEffect, useState } from "react";
import { useAuth } from "@/lib/auth";
import { useRouter } from "next/navigation";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { MessageSquare, Search, Filter, MoreVertical } from "lucide-react";
import { toast } from "sonner";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";

interface Conversation {
  id: string;
  jobTitle: string;
  otherUser: {
    id: string;
    name: string;
    avatar?: string;
    isOnline: boolean;
  };
  lastMessage: {
    content: string;
    timestamp: string;
    isRead: boolean;
    senderId: string;
  };
  type: 'job' | 'contract' | 'archived';
}

export default function Messages() {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState("");
  const [activeFilter, setActiveFilter] = useState<'all' | 'archived'>('all');
  const { user, checkAuth } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/login');
      return;
    }

    fetchConversations();
  }, [user?.id]);

  const fetchConversations = async () => {
    try {
      setIsLoading(true);
      // Mock data - replace with API call
      const mockConversations: Conversation[] = [
        {
          id: "1",
          jobTitle: "Website Development Project",
          otherUser: {
            id: "user1",
            name: "John Client",
            isOnline: true,
          },
          lastMessage: {
            content: "Can you provide an update on the homepage design?",
            timestamp: new Date().toISOString(),
            isRead: false,
            senderId: "user1"
          },
          type: 'job'
        },
        {
          id: "2",
          jobTitle: "Mobile App Development",
          otherUser: {
            id: "user2",
            name: "Sarah Manager",
            isOnline: false,
          },
          lastMessage: {
            content: "The milestone has been approved and payment released",
            timestamp: new Date(Date.now() - 86400000).toISOString(),
            isRead: true,
            senderId: user?.id || ""
          },
          type: 'contract'
        },
      ];
      
      setConversations(mockConversations);
    } catch (error) {
      console.error('Error fetching conversations:', error);
      toast.error('Failed to load messages');
    } finally {
      setIsLoading(false);
    }
  };

  // Filter conversations based on search and active filter
  const filteredConversations = conversations.filter(conv => {
    const matchesSearch = searchQuery.toLowerCase() === '' || 
      conv.otherUser.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      conv.jobTitle.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesFilter = activeFilter === 'all' ? 
      conv.type !== 'archived' : 
      conv.type === 'archived';

    return matchesSearch && matchesFilter;
  });

  return (
    <div className="container mx-auto px-4 py-8 mt-16 max-w-6xl">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Left Sidebar - Conversations List */}
        <div className="md:col-span-1 border rounded-lg">
          <div className="p-4 border-b">
            <div className="relative mb-4">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
              <Input
                placeholder="Search messages"
                className="pl-10"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
            <div className="flex gap-2">
              <Button
                variant={activeFilter === 'all' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('all')}
              >
                Active
              </Button>
              <Button
                variant={activeFilter === 'archived' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setActiveFilter('archived')}
              >
                Archived
              </Button>
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
              </Button>
            </div>
          </div>

          <div className="divide-y">
            {filteredConversations.map((conv) => (
              <div
                key={conv.id}
                className="p-4 hover:bg-muted/50 cursor-pointer relative"
                onClick={() => router.push(`/messages/${conv.id}`)}
              >
                <div className="flex items-start gap-3">
                  <div className="relative">
                    <Avatar className="h-10 w-10">
                      <AvatarImage src={conv.otherUser.avatar} />
                      <AvatarFallback>
                        {conv.otherUser.name.split(' ').map(n => n[0]).join('')}
                      </AvatarFallback>
                    </Avatar>
                    {conv.otherUser.isOnline && (
                      <span className="absolute bottom-0 right-0 h-3 w-3 rounded-full bg-green-500 border-2 border-background" />
                    )}
                  </div>
                  <div className="flex-1 min-w-0">
                    <div className="flex justify-between items-start">
                      <div className="truncate">
                        <h3 className="font-medium text-sm">{conv.otherUser.name}</h3>
                        <p className="text-xs text-muted-foreground truncate">{conv.jobTitle}</p>
                      </div>
                      <div className="flex flex-col items-end">
                        <span className="text-xs text-muted-foreground">
                          {new Date(conv.lastMessage.timestamp).toLocaleDateString()}
                        </span>
                        {!conv.lastMessage.isRead && conv.lastMessage.senderId !== user?.id && (
                          <span className="h-2 w-2 rounded-full bg-primary mt-1" />
                        )}
                      </div>
                    </div>
                    <p className="text-sm text-muted-foreground truncate mt-1">
                      {conv.lastMessage.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Right Side - Select a conversation */}
        <div className="hidden md:block md:col-span-2 border rounded-lg">
          <div className="h-full flex items-center justify-center text-center p-8">
            <div>
              <MessageSquare className="h-12 w-12 mx-auto text-muted-foreground mb-4" />
              <h2 className="text-lg font-semibold mb-2">Select a conversation</h2>
              <p className="text-muted-foreground">
                Choose a conversation from the list to start messaging
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}