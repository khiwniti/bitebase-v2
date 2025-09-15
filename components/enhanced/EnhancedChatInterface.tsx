import { useState, useRef, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Badge } from '@/components/ui/badge';
import { ChatMessage } from '@/types';
import { useWebSocket } from '@/hooks/useWebSocket';
import { 
  Send, 
  Loader2, 
  MapPin, 
  BarChart3, 
  Users, 
  Bot, 
  User, 
  Brain, 
  Target, 
  Shield, 
  Building, 
  TrendingUp,
  Sparkles,
  MessageSquare,
  ArrowDown,
  PanelRightOpen,
  PanelRightClose
} from 'lucide-react';
import { format } from 'date-fns';
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';
import { cn } from '@/lib/utils';
import { StickToBottom, useStickToBottomContext } from 'use-stick-to-bottom';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';

interface EnhancedChatInterfaceProps {
  sessionId: string | null;
  messages: ChatMessage[];
  onSendMessage: (content: string) => void;
  isLoading?: boolean;
  className?: string;
  onLocationUpdate?: (location: { lat: number; lng: number; address: string }) => void;
  onBusinessContextUpdate?: (context: any) => void;
}

// Agent type definitions with enhanced capabilities
const AGENT_TYPES = {
  coordinator: { icon: Brain, label: "Research Coordinator", color: "bg-primary", description: "Orchestrates multi-agent research" },
  demographics: { icon: Users, label: "Demographics Agent", color: "bg-blue-500", description: "Population and market analysis" },
  competitors: { icon: Target, label: "Competitor Agent", color: "bg-red-500", description: "Competitive landscape research" },
  traffic: { icon: BarChart3, label: "Traffic Agent", color: "bg-green-500", description: "Foot traffic and visitor patterns" },
  sites: { icon: Building, label: "Sites Agent", color: "bg-purple-500", description: "Location recommendations" },
  zoning: { icon: Shield, label: "Zoning Agent", color: "bg-orange-500", description: "Regulatory compliance" },
  deepresearch: { icon: Sparkles, label: "Deep Research Agent", color: "bg-indigo-500", description: "Advanced research capabilities" },
} as const;

// Suggested queries for intelligent recommendations
const SUGGESTED_QUERIES = [
  {
    category: "Demographics",
    queries: [
      "What are the demographics in this area?",
      "Show me population density and income levels",
      "Analyze target customer segments nearby"
    ]
  },
  {
    category: "Competition",
    queries: [
      "Find competitors within 1 mile radius",
      "Analyze competitive pricing strategies",
      "What's the market saturation level?"
    ]
  },
  {
    category: "Location",
    queries: [
      "Recommend optimal restaurant locations",
      "Show foot traffic patterns",
      "Check zoning compliance for food service"
    ]
  },
  {
    category: "Deep Research",
    queries: [
      "Conduct comprehensive market analysis",
      "Research industry trends and opportunities",
      "Generate detailed feasibility report"
    ]
  }
];

function StickyToBottomContent({ content }: { content: ReactNode }) {
  const { isAtBottom, scrollToBottom } = useStickToBottomContext();
  
  return (
    <div className="relative flex-1">
      {content}
      <AnimatePresence>
        {!isAtBottom && (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute bottom-4 right-4"
          >
            <Button
              size="sm"
              variant="outline"
              onClick={() => scrollToBottom()}
              className="rounded-full shadow-lg"
            >
              <ArrowDown className="w-4 h-4" />
            </Button>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}

export function EnhancedChatInterface({
  sessionId,
  messages,
  onSendMessage,
  isLoading = false,
  className = "",
  onLocationUpdate,
  onBusinessContextUpdate
}: EnhancedChatInterfaceProps) {
  const [inputValue, setInputValue] = useState('');
  const [isTyping, setIsTyping] = useState(false);
  const [activeAgents, setActiveAgents] = useState<string[]>([]);
  const [agentInsights, setAgentInsights] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  const { isConnected, lastMessage } = useWebSocket(sessionId);

  // Enhanced CopilotKit actions with deep research capabilities
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
    name: "triggerDeepResearch",
    description: "Trigger comprehensive deep research analysis",
    parameters: [
      { name: "topic", type: "string", description: "Research topic or question" },
      { name: "depth", type: "string", description: "Research depth level", enum: ["basic", "comprehensive", "expert"] },
      { name: "sources", type: "string[]", description: "Preferred research sources" },
    ],
    handler: async ({ topic, depth, sources }) => {
      setActiveAgents(prev => [...Array.from(new Set([...prev, "deepresearch"]))]);
      setAgentInsights(prev => [...prev, {
        type: "deepresearch",
        title: "Deep Research Initiated",
        description: `Conducting ${depth} research on: ${topic}`,
        timestamp: new Date().toISOString()
      }]);
      return `Deep research analysis started for: ${topic}`;
    },
  });

  // Make agent state readable by CopilotKit
  useCopilotReadable({
    description: "Current active agents, insights, and research capabilities",
    value: { 
      activeAgents, 
      agentInsights, 
      sessionId,
      availableAgents: Object.keys(AGENT_TYPES),
      researchCapabilities: ["demographic_analysis", "competitor_research", "traffic_analysis", "site_recommendations", "zoning_compliance", "deep_research"]
    }
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
    setShowSuggestions(false);
    
    // Focus back to input
    setTimeout(() => inputRef.current?.focus(), 100);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSuggestionClick = (query: string) => {
    setInputValue(query);
    setShowSuggestions(false);
    inputRef.current?.focus();
  };

  const getAgentAvatar = (role: string, metadata?: any) => {
    if (role === 'user') return null;
    
    const agentType = metadata?.agentType || 'general';
    const agent = AGENT_TYPES[agentType as keyof typeof AGENT_TYPES];
    
    if (!agent) {
      return (
        <div className="w-6 h-6 bg-primary rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0">
          AI
        </div>
      );
    }
    
    const IconComponent = agent.icon;
    
    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <div className={`w-6 h-6 ${agent.color} rounded-full flex items-center justify-center text-white text-xs font-bold flex-shrink-0`}>
              <IconComponent size={12} />
            </div>
          </TooltipTrigger>
          <TooltipContent>
            <p className="font-medium">{agent.label}</p>
            <p className="text-xs text-muted-foreground">{agent.description}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
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
    <div className={cn("flex flex-col h-full", className)} data-testid="enhanced-chat-interface">
      {/* Enhanced Chat Header */}
      <div className="p-4 border-b border-border flex-shrink-0" data-testid="chat-header">
        <div className="flex items-center justify-between mb-2">
          <h2 className="font-semibold flex items-center gap-2">
            <Brain className="w-5 h-5 text-primary" />
            AI Market Research Assistant
          </h2>
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setShowSuggestions(!showSuggestions)}
              className="text-xs"
            >
              <Sparkles className="w-4 h-4 mr-1" />
              Suggestions
            </Button>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              {sidebarOpen ? <PanelRightClose className="w-4 h-4" /> : <PanelRightOpen className="w-4 h-4" />}
            </Button>
          </div>
        </div>
        
        <div className="flex items-center space-x-2 text-sm text-muted-foreground mb-3">
          <div className={`w-2 h-2 rounded-full ${isConnected ? 'bg-primary animate-pulse' : 'bg-muted-foreground'}`} />
          <span data-testid="connection-status">
            {isConnected ? 'Multi-agent system ready' : 'Reconnecting...'}
          </span>
          <Badge variant="secondary" className="text-xs">
            Enhanced with Deep Research
          </Badge>
        </div>

        {/* Active Agents Display */}
        {activeAgents.length > 0 && (
          <div className="flex flex-wrap gap-2">
            {activeAgents.map(agentType => {
              const agent = AGENT_TYPES[agentType as keyof typeof AGENT_TYPES];
              if (!agent) return null;
              const IconComponent = agent.icon;
              return (
                <motion.div
                  key={agentType}
                  initial={{ opacity: 0, scale: 0.8 }}
                  animate={{ opacity: 1, scale: 1 }}
                  className="flex items-center"
                >
                  <Badge variant="secondary" className="text-xs">
                    <IconComponent size={12} className="mr-1" />
                    {agent.label}
                  </Badge>
                </motion.div>
              );
            })}
          </div>
        )}
      </div>

      {/* Suggestions Panel */}
      <AnimatePresence>
        {showSuggestions && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="border-b border-border bg-muted/30"
          >
            <div className="p-4">
              <h3 className="text-sm font-medium mb-3 flex items-center gap-2">
                <Sparkles className="w-4 h-4" />
                Intelligent Suggestions
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                {SUGGESTED_QUERIES.map((category, categoryIndex) => (
                  <div key={categoryIndex} className="space-y-2">
                    <h4 className="text-xs font-medium text-muted-foreground">{category.category}</h4>
                    <div className="space-y-1">
                      {category.queries.map((query, queryIndex) => (
                        <Button
                          key={queryIndex}
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSuggestionClick(query)}
                          className="text-xs h-auto p-2 justify-start text-left w-full hover:bg-primary/10"
                        >
                          {query}
                        </Button>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Messages Area with Sticky Bottom */}
      <StickToBottom className="flex-1">
        <StickyToBottomContent
          content={
            <ScrollArea className="h-full p-4" data-testid="messages-area">
              <div className="space-y-4">
                {messages.length === 0 ? (
                  <div className="text-center text-muted-foreground py-8" data-testid="empty-chat">
                    <div className="mb-4">
                      <div className="w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4">
                        <Brain className="w-8 h-8 text-primary" />
                      </div>
                      <h3 className="font-semibold mb-2">Start Your Enhanced Market Research</h3>
                      <p className="text-sm">Ask me about demographics, competitors, deep research, or get intelligent suggestions.</p>
                    </div>
                    
                    <div className="flex flex-wrap gap-2 justify-center">
                      {[
                        "Conduct deep research on restaurant trends",
                        "Show comprehensive competitor analysis",
                        "What are the demographics here?",
                        "Generate detailed market report"
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
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
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

                        <div className={`text-xs mt-1 ${message.role === 'user' ? 'text-white/70' : 'text-muted-foreground'}`}>
                          {formatMessageTime(message.createdAt)}
                        </div>
                      </div>
                    </motion.div>
                  ))
                )}

                {/* Enhanced Typing Indicator */}
                {(isTyping || isLoading) && (
                  <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="flex justify-start"
                    data-testid="typing-indicator"
                  >
                    <div className="chat-bubble-ai p-3 rounded-lg">
                      <div className="flex items-center space-x-2">
                        <div className="w-6 h-6 bg-accent rounded-full flex items-center justify-center text-white text-xs font-bold">
                          <Brain size={12} />
                        </div>
                        <div className="flex space-x-1">
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.2s' }} />
                          <div className="w-2 h-2 bg-muted-foreground rounded-full animate-pulse" style={{ animationDelay: '0.4s' }} />
                        </div>
                        <span className="text-xs text-muted-foreground">AI agents thinking...</span>
                      </div>
                    </div>
                  </motion.div>
                )}

                <div ref={messagesEndRef} />
              </div>
            </ScrollArea>
          }
        />
      </StickToBottom>

      {/* Enhanced Input Area */}
      <div className="p-4 border-t border-border flex-shrink-0" data-testid="chat-input-area">
        <div className="flex items-center space-x-2">
          <Input
            ref={inputRef}
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Ask about demographics, competitors, deep research..."
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
