'use client'

'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { CopilotKit } from '@copilotkit/react-core';
import { CopilotSidebar } from '@copilotkit/react-ui';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { EnhancedChatInterface } from '@/components/enhanced/EnhancedChatInterface';
import { CopilotSuggestions, QuickSuggestions } from '@/components/copilot/CopilotSuggestions';
import { 
  HeadlessAgentMonitor, 
  HeadlessTaskTracker, 
  HeadlessSystemInsights,
  type AgentStatus,
  type TaskProgress,
  type SystemInsight
} from '@/components/copilot/HeadlessUI';
import { MapCanvas } from '@/components/MapCanvas';
import { useAuth } from '@/hooks/useAuth';
import { useChatSession } from '@/hooks/useChatSession';
import { MapState } from '@/types';
import { DEFAULT_MAP_STATE } from '@/lib/mapUtils';
import { 
  Brain, 
  Sparkles, 
  Map, 
  BarChart3, 
  Users, 
  Target, 
  Building, 
  Shield,
  Settings,
  Maximize2,
  Minimize2,
  RefreshCw
} from 'lucide-react';

export default function EnhancedDashboard() {
  const { user } = useAuth();
  const [currentLocation, setCurrentLocation] = useState<{ lat: number; lng: number; address: string } | undefined>();
  const [businessContext, setBusinessContext] = useState<any>();
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [activeTab, setActiveTab] = useState('chat');
  const [mapState, setMapState] = useState<MapState>(DEFAULT_MAP_STATE);
  
  // Mock agent status for demonstration
  const [agentStatus, setAgentStatus] = useState<AgentStatus[]>([
    {
      id: 'demographics',
      name: 'Demographics Agent',
      status: 'idle',
      lastUpdate: new Date()
    },
    {
      id: 'competitors',
      name: 'Competitor Agent',
      status: 'idle',
      lastUpdate: new Date()
    },
    {
      id: 'deepresearch',
      name: 'Deep Research Agent',
      status: 'idle',
      lastUpdate: new Date()
    }
  ]);

  // Mock task progress for demonstration
  const [taskProgress, setTaskProgress] = useState<TaskProgress[]>([]);

  // Mock system insights for demonstration
  const [systemInsights, setSystemInsights] = useState<SystemInsight[]>([
    {
      id: 'welcome',
      type: 'info',
      title: 'Enhanced AI System Ready',
      message: 'Your enhanced market research system with deep research capabilities is now active.',
      timestamp: new Date(),
      actionable: true,
      action: () => console.log('Welcome action triggered')
    }
  ]);

  // Chat session management
  const {
    sessionId,
    messages,
    sendMessage,
    isLoading,
    error
  } = useChatSession();

  // Simulate agent activity
  useEffect(() => {
    const interval = setInterval(() => {
      setAgentStatus(prev => prev.map(agent => {
        if (Math.random() > 0.8) {
          const statuses: AgentStatus['status'][] = ['idle', 'thinking', 'working', 'complete'];
          const newStatus = statuses[Math.floor(Math.random() * statuses.length)];
          return {
            ...agent,
            status: newStatus,
            progress: newStatus === 'working' ? Math.floor(Math.random() * 100) : undefined,
            message: newStatus === 'working' ? 'Processing data...' : undefined,
            lastUpdate: new Date()
          };
        }
        return agent;
      }));
    }, 3000);

    return () => clearInterval(interval);
  }, []);

  const handleLocationUpdate = (location: { lat: number; lng: number; address: string }) => {
    setCurrentLocation(location);
    
    // Add system insight about location update
    setSystemInsights(prev => [...prev, {
      id: `location-${Date.now()}`,
      type: 'success',
      title: 'Location Updated',
      message: `Map centered on ${location.address}. Agents can now provide location-specific analysis.`,
      timestamp: new Date(),
      actionable: false
    }]);
  };

  const handleBusinessContextUpdate = (context: any) => {
    setBusinessContext(context);
    
    // Add system insight about business context
    setSystemInsights(prev => [...prev, {
      id: `business-${Date.now()}`,
      type: 'info',
      title: 'Business Context Set',
      message: `Analysis configured for ${context.businessType}. Recommendations will be tailored accordingly.`,
      timestamp: new Date(),
      actionable: false
    }]);
  };

  const handleSuggestionClick = (suggestion: string) => {
    sendMessage(suggestion);
    
    // Simulate task creation
    setTaskProgress(prev => [...prev, {
      id: `task-${Date.now()}`,
      title: suggestion,
      description: 'AI agent processing request',
      progress: 0,
      status: 'active',
      estimatedTime: 30
    }]);
  };

  return (
    <CopilotKit 
      publicLicenseKey="ck_pub_4bae12d076311a78139ec12d2215c973"
      runtimeUrl={process.env.NEXT_PUBLIC_COPILOT_RUNTIME_URL || "/api/copilotkit"}
      agent="gpt-4o"
    >
      <div className="min-h-screen bg-background">
        {/* Enhanced Header */}
        <header className="border-b border-border bg-background/95 backdrop-blur-sm sticky top-0 z-40">
          <div className="container mx-auto px-4 py-3">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Brain className="w-8 h-8 text-primary" />
                  <div>
                    <h1 className="text-xl font-bold">BiteBase Intelligence AI</h1>
                    <p className="text-xs text-muted-foreground">Enhanced with Deep Research</p>
                  </div>
                </div>
                
                <Badge variant="secondary" className="text-xs">
                  <Sparkles className="w-3 h-3 mr-1" />
                  Enhanced
                </Badge>
              </div>

              <div className="flex items-center gap-2">
                <HeadlessAgentMonitor agents={agentStatus} compact />
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setSidebarOpen(!sidebarOpen)}
                >
                  <Settings className="w-4 h-4" />
                </Button>
              </div>
            </div>
          </div>
        </header>

        <div className="container mx-auto px-4 py-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Main Content Area */}
            <div className="lg:col-span-3 space-y-6">
              {/* Quick Actions */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-lg">
                    <Sparkles className="w-5 h-5 text-primary" />
                    Quick Actions
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <QuickSuggestions onSuggestionClick={handleSuggestionClick} />
                </CardContent>
              </Card>

              {/* Main Interface Tabs */}
              <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
                <TabsList className="grid w-full grid-cols-3">
                  <TabsTrigger value="chat" className="flex items-center gap-2">
                    <Brain className="w-4 h-4" />
                    AI Chat
                  </TabsTrigger>
                  <TabsTrigger value="map" className="flex items-center gap-2">
                    <Map className="w-4 h-4" />
                    Interactive Map
                  </TabsTrigger>
                  <TabsTrigger value="insights" className="flex items-center gap-2">
                    <BarChart3 className="w-4 h-4" />
                    Insights
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="chat" className="mt-6">
                  <Card className="h-[600px]">
                    <EnhancedChatInterface
                      sessionId={sessionId}
                      messages={messages}
                      onSendMessage={sendMessage}
                      isLoading={isLoading}
                      onLocationUpdate={handleLocationUpdate}
                      onBusinessContextUpdate={handleBusinessContextUpdate}
                      className="h-full"
                    />
                  </Card>
                </TabsContent>

                <TabsContent value="map" className="mt-6">
                  <Card className="h-[600px]">
                    <CardContent className="p-0 h-full">
                      <MapCanvas
                        sessionId={sessionId}
                        mapState={mapState}
                        onMapUpdate={setMapState}
                        onLocationUpdate={handleLocationUpdate}
                        className="h-full rounded-lg"
                      />
                    </CardContent>
                  </Card>
                </TabsContent>

                <TabsContent value="insights" className="mt-6">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Agent Performance</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-4">
                          {agentStatus.map(agent => (
                            <div key={agent.id} className="flex items-center justify-between p-3 border rounded-lg">
                              <div>
                                <p className="font-medium">{agent.name}</p>
                                <p className="text-sm text-muted-foreground">{agent.status}</p>
                              </div>
                              <Badge variant={agent.status === 'complete' ? 'default' : 'secondary'}>
                                {agent.status}
                              </Badge>
                            </div>
                          ))}
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="text-lg">Research Capabilities</CardTitle>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <Users className="w-5 h-5 text-blue-500" />
                            <div>
                              <p className="font-medium">Demographics Analysis</p>
                              <p className="text-sm text-muted-foreground">Population and market insights</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <Target className="w-5 h-5 text-red-500" />
                            <div>
                              <p className="font-medium">Competitor Research</p>
                              <p className="text-sm text-muted-foreground">Competitive landscape analysis</p>
                            </div>
                          </div>
                          
                          <div className="flex items-center gap-3 p-3 border rounded-lg">
                            <Sparkles className="w-5 h-5 text-purple-500" />
                            <div>
                              <p className="font-medium">Deep Research</p>
                              <p className="text-sm text-muted-foreground">Comprehensive market analysis</p>
                            </div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </div>

            {/* Sidebar */}
            <div className="lg:col-span-1 space-y-6">
              {/* Intelligent Suggestions */}
              <CopilotSuggestions
                onSuggestionClick={handleSuggestionClick}
                currentLocation={currentLocation}
                businessContext={businessContext}
                activeAgents={agentStatus.filter(a => a.status !== 'idle').map(a => a.id)}
              />

              {/* Agent Monitor */}
              <HeadlessAgentMonitor agents={agentStatus} />

              {/* Task Progress */}
              {taskProgress.length > 0 && (
                <HeadlessTaskTracker tasks={taskProgress} />
              )}

              {/* System Insights */}
              <HeadlessSystemInsights insights={systemInsights} />
            </div>
          </div>
        </div>

        {/* CopilotKit Sidebar */}
        <CopilotSidebar
          instructions="You are an AI assistant specialized in restaurant and cafe market research. Help users analyze demographics, competitors, foot traffic, and generate comprehensive market insights using advanced research capabilities."
          defaultOpen={sidebarOpen}
          clickOutsideToClose={false}
        />
      </div>
    </CopilotKit>
  );
}
