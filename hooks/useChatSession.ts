import { useState, useEffect } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';
import { apiRequest } from '@/lib/queryClient';
import { isUnauthorizedError } from '@/lib/authUtils';
import { ChatMessage, ChatSession } from '@/types';

interface UseChatSessionReturn {
  sessionId: string | null;
  session: ChatSession | null;
  messages: ChatMessage[];
  sendMessage: (content: string) => Promise<void>;
  isLoading: boolean;
  error: string | null;
  createSession: (title?: string) => Promise<string>;
  isConnected: boolean;
}

export function useChatSession(initialSessionId?: string): UseChatSessionReturn {
  const [sessionId, setSessionId] = useState<string | null>(initialSessionId || null);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  // Fetch session details
  const { data: session, isLoading: sessionLoading } = useQuery({
    queryKey: ['/api/chat/sessions', sessionId],
    queryFn: async () => {
      if (!sessionId) return null;
      const response = await apiRequest('GET', `/api/chat/sessions/${sessionId}`);
      return (await response.json()) as ChatSession;
    },
    enabled: !!sessionId && isAuthenticated,
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutes
  });

  // Fetch messages for the session
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/chat/sessions', sessionId, 'messages'],
    queryFn: async () => {
      if (!sessionId) return [];
      const response = await apiRequest('GET', `/api/chat/sessions/${sessionId}/messages`);
      return (await response.json()) as ChatMessage[];
    },
    enabled: !!sessionId && isAuthenticated,
    retry: false,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Create new session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (title: string = 'New Research Session') => {
      const response = await apiRequest('POST', '/api/chat/sessions', {
        title,
        location: 'San Francisco, CA',
        mapState: {
          center: { lat: 37.7749, lng: -122.4194 },
          zoom: 12,
          layers: ['demographics', 'competitors', 'traffic']
        },
        status: 'active'
      });
      return (await response.json()) as ChatSession;
    },
    onSuccess: (newSession) => {
      setSessionId(newSession.id);
      setError(null);
      queryClient.invalidateQueries({ queryKey: ['/api/chat/sessions'] });
    },
    onError: (error) => {
      console.error('Failed to create session:', error);
      setError('Failed to create chat session');
      
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Please log in again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to create chat session",
          variant: "destructive",
        });
      }
    },
  });

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!sessionId) {
        throw new Error('No active session');
      }
      
      const response = await apiRequest('POST', `/api/chat/sessions/${sessionId}/messages`, {
        content,
        role: 'user',
        timestamp: new Date().toISOString()
      });
      
      return (await response.json()) as ChatMessage;
    },
    onSuccess: () => {
      // Invalidate messages to refetch
      queryClient.invalidateQueries({ 
        queryKey: ['/api/chat/sessions', sessionId, 'messages'] 
      });
      setError(null);
    },
    onError: (error) => {
      console.error('Failed to send message:', error);
      setError('Failed to send message');
      
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Please log in again.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Error",
          description: "Failed to send message",
          variant: "destructive",
        });
      }
    },
  });

  // Clear error when session changes
  useEffect(() => {
    setError(null);
  }, [sessionId]);

  // Auto-create session if needed
  useEffect(() => {
    if (isAuthenticated && !sessionId && !sessionLoading && !createSessionMutation.isPending) {
      // Only auto-create if we don't have a session and aren't already loading one
      createSessionMutation.mutate('New Analysis Session');
    }
  }, [isAuthenticated, sessionId, sessionLoading, createSessionMutation]);

  const sendMessage = async (content: string): Promise<void> => {
    if (!content.trim()) return;
    
    try {
      await sendMessageMutation.mutateAsync(content);
    } catch (error) {
      // Error handling is done in the mutation's onError
      throw error;
    }
  };

  const createSession = async (title?: string): Promise<string> => {
    try {
      const newSession = await createSessionMutation.mutateAsync(title);
      return newSession.id;
    } catch (error) {
      throw error;
    }
  };

  const isLoading = sessionLoading || messagesLoading || sendMessageMutation.isPending || createSessionMutation.isPending;
  const isConnected = isAuthenticated && !!sessionId && !error;

  return {
    sessionId,
    session: session || null,
    messages,
    sendMessage,
    isLoading,
    error,
    createSession,
    isConnected,
  };
}