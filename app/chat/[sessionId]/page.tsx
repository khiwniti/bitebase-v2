'use client'

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams, useParams } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import { useToast } from '@/hooks/use-toast';
import { isUnauthorizedError } from '@/lib/authUtils';
import { ChatInterface } from '@/components/ChatInterface';
import { MapCanvas } from '@/components/MapCanvas';
import { ChatSession, ChatMessage, MapState } from '@/types';
import { DEFAULT_MAP_STATE } from '@/lib/mapUtils';
import { ArrowLeft, Download, Settings, Loader2 } from 'lucide-react';

export default function ChatSession() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const params = useParams();
  const { user, isAuthenticated, isLoading: authLoading } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const [mapState, setMapState] = useState<MapState>(DEFAULT_MAP_STATE);
  const [initialQuery, setInitialQuery] = useState<string | null>(null);
  const sessionId = params.sessionId as string;

  // Get initial query from URL params
  useEffect(() => {
    const query = searchParams.get('q');
    setInitialQuery(query);
  }, [searchParams]);

  // Handle unauthorized access
  useEffect(() => {
    if (!authLoading && !isAuthenticated) {
      toast({
        title: "Unauthorized",
        description: "You are logged out. Redirecting to home...",
        variant: "destructive",
      });
      setTimeout(() => {
        router.push("/");
      }, 500);
      return;
    }
  }, [isAuthenticated, authLoading, toast, router]);

  // Fetch chat session
  const { data: session, isLoading: sessionLoading, error: sessionError } = useQuery({
    queryKey: ['/api/chat/sessions', sessionId],
    enabled: !!sessionId && isAuthenticated,
    retry: false,
  });

  // Fetch messages for the session
  const { data: messages = [], isLoading: messagesLoading } = useQuery({
    queryKey: ['/api/chat/sessions', sessionId, 'messages'],
    enabled: !!sessionId && isAuthenticated,
    retry: false,
  }) as { data: ChatMessage[], isLoading: boolean };

  // Send message mutation
  const sendMessageMutation = useMutation({
    mutationFn: async (content: string) => {
      if (!sessionId) throw new Error('No active session');
      
      const response = await apiRequest('POST', '/api/chat/messages', {
        sessionId: sessionId,
        role: 'user',
        content
      });
      return response.json();
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ 
        queryKey: ['/api/chat/sessions', sessionId, 'messages'] 
      });
    },
    onError: (error) => {
      if (isUnauthorizedError(error)) {
        toast({
          title: "Unauthorized",
          description: "You are logged out. Redirecting to home...",
          variant: "destructive",
        });
        setTimeout(() => {
          router.push("/");
        }, 500);
        return;
      }
      toast({
        title: "Error",
        description: "Failed to send message",
        variant: "destructive",
      });
    },
  });

  // Generate report mutation
  const generateReportMutation = useMutation({
    mutationFn: async () => {
      if (!sessionId) throw new Error('No active session');
      
      const response = await apiRequest('POST', `/api/reports/generate/${sessionId}`);
      return response.json();
    },
    onSuccess: (report) => {
      router.push(`/report/${report.id}`);
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: "Failed to generate report",
        variant: "destructive",
      });
    },
  });

  // Initialize session and map state
  useEffect(() => {
    if (session && (session as ChatSession).mapState) {
      try {
        const parsedMapState = JSON.parse((session as ChatSession).mapState as string);
        setMapState(parsedMapState);
      } catch (e) {
        console.warn('Failed to parse mapState from session:', e);
        setMapState(DEFAULT_MAP_STATE);
      }
    }
  }, [session]);

  // Send initial query if provided
  useEffect(() => {
    if (initialQuery && sessionId && messages.length === 0 && !sendMessageMutation.isPending) {
      sendMessageMutation.mutate(initialQuery);
      // Clear the query param
      router.replace(`/chat/${sessionId}`);
    }
  }, [initialQuery, sessionId, messages.length, sendMessageMutation, router]);

  // Handle map updates
  const handleMapUpdate = (newMapState: MapState) => {
    setMapState(newMapState);
    
    // Update session with new map state
    if (sessionId) {
      apiRequest('PATCH', `/api/chat/sessions/${sessionId}`, {
        mapState: JSON.stringify(newMapState)
      }).catch(console.error);
    }
  };

  // Handle sending messages
  const handleSendMessage = (content: string) => {
    sendMessageMutation.mutate(content);
  };

  if (authLoading || sessionLoading) {
    return (
      <div className="h-screen flex items-center justify-center" data-testid="loading-screen">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading your research session...</p>
        </div>
      </div>
    );
  }

  if (sessionError) {
    return (
      <div className="h-screen flex items-center justify-center" data-testid="error-screen">
        <div className="text-center max-w-md">
          <h2 className="text-xl font-semibold mb-2">Session Not Found</h2>
          <p className="text-muted-foreground mb-4">The research session you're looking for doesn't exist or you don't have access to it.</p>
          <Button onClick={() => router.push('/')} data-testid="back-to-home">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Back to Home
          </Button>
        </div>
      </div>
    );
  }

  if (!session) {
    return (
      <div className="h-screen flex items-center justify-center" data-testid="no-session">
        <div className="text-center">
          <Loader2 className="w-8 h-8 animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground">Loading session...</p>
        </div>
      </div>
    );
  }

  const currentSession = session as ChatSession;

  return (
    <div className="h-screen flex flex-col" data-testid="chat-page">
      {/* Top Navigation */}
      <nav className="bg-white/90 backdrop-blur-lg border-b border-border px-4 py-3 flex-shrink-0">
        <div className="flex justify-between items-center">
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/')}
              data-testid="back-button"
            >
              <ArrowLeft className="w-4 h-4" />
            </Button>
            <div className="flex items-center space-x-2">
              <div className="w-2 h-2 bg-primary rounded-full" />
              <span className="font-semibold">{currentSession.title}</span>
            </div>
          </div>
          <div className="flex items-center space-x-4">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => generateReportMutation.mutate()}
              disabled={generateReportMutation.isPending || messages.length === 0}
              data-testid="export-report-button"
            >
              {generateReportMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin mr-1" />
              ) : (
                <Download className="w-4 h-4 mr-1" />
              )}
              Export Report
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => router.push('/settings')}
              data-testid="settings-button"
            >
              <Settings className="w-4 h-4" />
            </Button>
          </div>
        </div>
      </nav>

      {/* Main Content */}
      <div className="flex-1 flex min-h-0">
        {/* Chat Panel */}
        <div className="w-1/3 border-r border-border flex flex-col min-h-0">
          <ChatInterface
            sessionId={sessionId}
            messages={messages}
            onSendMessage={handleSendMessage}
            isLoading={sendMessageMutation.isPending}
          />
        </div>

        {/* Map Canvas */}
        <div className="flex-1 min-h-0">
          <MapCanvas
            sessionId={sessionId}
            mapState={mapState}
            onMapUpdate={handleMapUpdate}
          />
        </div>
      </div>
    </div>
  );
}