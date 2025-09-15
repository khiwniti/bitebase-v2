import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from '@/types';
import { useWebSocket } from '@/hooks/useWebSocket';
import { Send, Loader2, MapPin, BarChart3, Users, Bot, User, Brain, Target, Shield, Building, TrendingUp } from 'lucide-react';
import { format } from 'date-fns';
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';

interface ChatInterfaceProps {
  sessionId: string;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  className?: string;
  onLocationUpdate?: (location: { lat: number; lng: number; address: string }) => void;
  onBusinessContextUpdate?: (context: any) => void;
}

// Agent type definitions
const AGENT_TYPES = {
  coordinator: { icon: Brain, label: "Research Coordinator", color: "bg-primary" },
  demographics: { icon: Users, label: "Demographics Agent", color: "bg-blue-500" },
  competitors: { icon: Target, label: "Competitor Agent", color: "bg-red-500" },
  traffic: { icon: BarChart3, label: "Traffic Agent", color: "bg-green-500" },
  sites: { icon: Building, label: "Sites Agent", color: "bg-purple-500" },
  zoning: { icon: Shield, label: "Zoning Agent", color: "bg-orange-500" },
} as const;

export function ChatInterface({
  sessionId,
  messages,
  onSendMessage,
  isLoading = false,
  className = "",
  onLocationUpdate,
  onBusinessContextUpdate
}: ChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [agentInsights, setAgentInsights] = useState<any[]>([]);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { isConnected, lastMessage } = useWebSocket(sessionId);

  // CopilotKit actions for multi-agent integration
  useCopilotAction({
    name: "updateMapLocation",
    description: "Update the map location and trigger location-based analysis",
    parameters: [
      { name: "lat", type: "number", description: "Latitude coordinate" },
      { name: "lng", type: "number", description: "Longitude coordinate" },
      { name: "address", type: "string", description: "Human-readable address" },
    ],
    handler: async ({ lat, lng, address }) => {
      const location = { lat, lng, address };
      onLocationUpdate?.(location);
      setAgentInsights(prev => [...prev, {
        type: "location",
        title: "Location Updated",
        description: `Map centered on ${address}`,
        timestamp: new Date().toISOString()
      }]);
      return `Location updated to ${address}`;
    },
  });

  useCopilotAction({
    name: "setBusinessContext",
    description: "Set the business context for market research analysis",
    parameters: [
      { name: "businessType", type: "string", description: "Type of restaurant/cafe business" },
      { name: "targetMarket", type: "string", description: "Target customer demographic" },
      { name: "budget", type: "number", description: "Monthly budget for rent/operations" },
      { name: "timeline", type: "string", description: "Timeline for opening" },
    ],
    handler: async (context) => {
      onBusinessContextUpdate?.(context);
      setAgentInsights(prev => [...prev, {
        type: "business",
        title: "Business Context Set",
        description: `Analyzing for ${context.businessType}`,
        timestamp: new Date().toISOString()
      }]);
      return `Business context set for ${context.businessType}`;
    },
  });

  useCopilotAction({
    name: "triggerAgentAnalysis",
    description: "Trigger specific agent analysis",
    parameters: [
      { name: "agentType", type: "string", description: "Type of agent to activate" },
      { name: "parameters", type: "object", description: "Analysis parameters" },
    ],
    handler: async ({ agentType, parameters }) => {
      setActiveAgents(prev => [...prev, agentType].filter((value, index, arr) => arr.indexOf(value) === index));
      setAgentInsights(prev => [...prev, {
        type: agentType,
        title: `${AGENT_TYPES[agentType as keyof typeof AGENT_TYPES]?.label || agentType} Activated`,
        description: "Analysis in progress...",
        timestamp: new Date().toISOString()
      }]);
      return `${agentType} analysis initiated`;
    },
  });

  // Make agent state readable by CopilotKit
  useCopilotReadable({
    description: "Current active agents and insights",
    value: { activeAgents, agentInsights, sessionId }
  });

  // Auto-scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // Handle incoming WebSocket messages
  useEffect(() => {
    if (lastMessage?.type === 'chat_update' && lastMessage.sessionId === sessionId) {
      setIsTyping(false);
    }
  }, [lastMessage, sessionId]);

  const handleSend = () => {
    if (!inputValue.trim() || isLoading) return;
    
    onSendMessage(inputValue.trim());
    setInputValue('');
    setIsTyping(true);
    
    // Focus back to input
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const getAgentAvatar = (role: string, metadata?: any) => {
    if (role === 'user') return null;
    
    const agentType = metadata?.agentType || 'general';
    const avatars = {
      demographics: { icon: Users, color: 'bg-blue-500' },
      location: { icon: MapPin, color: 'bg-green-500' },
      analysis: { icon: BarChart3, color: 'bg-purple-500' },
      general: { icon: null, color: 'bg-primary' }
    };
    
    const config = avatars[agentType as keyof typeof avatars] || avatars.general;
    const IconComponent = config.icon;
    
    return (
      <div className={`w-6 h-6 ${config.color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
        {IconComponent ? <IconComponent size={12} /> : 'AI'}
      </div>
    );
  };

  const formatMessageTime = (dateString: string) => {
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffMinutes = Math.floor((now.getTime() - date.getTime()) / (1000 * 60));
      
      if (diffMinutes < 1) return 'Just now';
      if (diffMinutes < 60) return `${diffMinutes}m ago`;
      if (diffMinutes < 1440) return `${Math.floor(diffMinutes / 60)}h ago`;
      return format(date, 'MMM d, h:mm a');
    } catch {
      return 'Unknown time';
    }
  };

  return (
    <div className={`flex flex-col h-full ${className}`} data-testid="chat-interface">
      {/* Chat Header */}
      <div className="p-4 border-b border-border flex-shrink-0" data-testid="chat-header">
        <h2 className="font-semibold mb-2">Market Research Assistant</h2>
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
          <span data-testid="connection-status">
            {isConnected ? 'Multi-agent system ready' : 'Reconnecting...'}
          </span>
        </div>

        {/* Active Agents Display */}
        {activeAgents.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeAgents.map(agentType => {
              const agent = AGENT_TYPES[agentType as keyof typeof AGENT_TYPES];
              if (!agent) return null;
              const IconComponent = agent.icon;
              return (
                <Badge key={agentType} variant="secondary" className="text-xs">
                  <IconComponent size={12} className="mr-1" />
                  {agent.label}
                </Badge>
              );
            })}
          </div>
        )}
      </div>

      {/* Messages Area */}
      <ScrollArea className="flex-1 p-4" data-testid="messages-area">
        <div className="space-y-4">
          {messages.length === 0 ? (
            <div className="text-center text-muted-foreground py-8" data-testid="empty-chat">
              <div className="mb-4">
                <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                  <MapPin className="w-8 h-8 text-primary" />
                </div>
                <h3 className="font-semibold mb-2">Start Your Market Research</h3>
                <p className="text-sm">Ask me about demographics, competitor analysis, foot traffic, or location recommendations.</p>
              </div>
              
              <div className="flex flex-wrap gap-2 justify-center">
                {[
                  "Show foot traffic in downtown",
                  "Analyze competitors nearby",
                  "What are the demographics here?",
                  "Find restaurant opportunities"
                ].map((suggestion, index) => (
                  <Button
                    key={index}
                    variant="outline"
                    size="sm"
                    onClick={() => setInputValue(suggestion)}
                    className="text-xs"
                    data-testid={`suggestion-${index}`}
                  >
                    {suggestion}
                  </Button>
                ))}
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <div
                key={message.id}
                className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
                data-testid={`message-${message.id}`}
              >
                <div className={`max-w-[85%] ${message.role === 'user' ? 'chat-bubble-user ml-auto' : 'chat-bubble-ai'} p-3 rounded-lg`}>
                  {message.role !== 'user' && (
                    <div className="flex items-start space-x-2 mb-2">
                      {getAgentAvatar(message.role, message.metadata)}
                      <div className="flex-1 min-w-0">
                        <div className="text-xs text-muted-foreground">
                          {message.metadata?.agentType || 'Assistant'}
                        </div>
                      </div>
                    </div>
                  )}
                  
                  <div className="text-sm mb-2 whitespace-pre-wrap">
                    {message.content}
                  </div>

                  {/* Map Actions */}
                  {message.metadata?.mapActions && message.metadata.mapActions.length > 0 && (
                    <div className="mb-2" data-testid={`map-actions-${message.id}`}>
                      <div className="text-xs text-muted-foreground mb-1">Map Actions:</div>
                      <div className="space-y-1">
                        {message.metadata.mapActions.map((action: any, index: number) => (
                          <Badge key={index} variant="secondary" className="text-xs mr-1">
                            {action.type}: {action.data?.layerId || action.data?.location || 'Updated'}
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {/* Follow-up Questions */}
                  {message.metadata?.followUpQuestions && message.metadata.followUpQuestions.length > 0 && (
                    <div className="mb-2" data-testid={`follow-up-${message.id}`}>
                      <div className="text-xs text-muted-foreground mb-1">Suggested questions:</div>
                      <div className="space-y-1">
                        {message.metadata.followUpQuestions.map((question: string, index: number) => (
                          <Button
                            key={index}
                            variant="ghost"
                            size="sm"
                            onClick={() => setInputValue(question)}
                            className="text-xs h-auto p-1 justify-start text-left w-full"
                            data-testid={`follow-up-question-${index}`}
                          >
                            {question}
                          </Button>
                        ))}
                      </div>
                    </div>
                  )}

                  <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
                    {formatMessageTime(message.createdAt)}
                  </div>
                </div>
              </div>
            ))
          )}

          {/* Typing Indicator */}
          {(isTyping || isLoading) && (
            <div className="flex justify-start" data-testid="typing-indicator">
              <div className="chat-bubble-ai p-3 rounded-lg">
                <div className="flex items-center space-x-2">
                  <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-xs font-bold">
                    AI
                  </div>
                  <div className="flex space-x-1">
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                    <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </ScrollArea>

      {/* Input Area */}
      <div className="p-4 border-t border-border flex-shrink-0" data-testid="chat-input-area">
        <div className="flex items-center space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about demographics, competitors, rent prices..."
            className="flex-1"
            disabled={isLoading}
            data-testid="chat-input"
          />
          <Button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading}
            size="sm"
            className="px-3"
            data-testid="send-button"
          >
            {isLoading ? (
              <Loader2 className="w-4 h-4 animate-spin" />
            ) : (
              <Send className="w-4 h-4" />
            )}
          </Button>
        </div>
        
        {!isConnected && (
          <div className="text-xs text-destructive mt-2" data-testid="connection-warning">
            Connection lost. Messages will be sent when reconnected.
          </div>
        )}
      </div>
    </div>
  );
}
