import { useState, useEffect, ReactNode } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useCopilotAction, useCopilotReadable } from '@copilotkit/react-core';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { 
  Brain, 
  CheckCircle, 
  Clock, 
  AlertCircle, 
  Loader2,
  Zap,
  Eye,
  EyeOff,
  Settings,
  Maximize2,
  Minimize2
} from 'lucide-react';

// Headless UI Component Types
interface AgentStatus {
  id: string;
  name: string;
  status: 'idle' | 'thinking' | 'working' | 'complete' | 'error';
  progress?: number;
  message?: string;
  lastUpdate: Date;
}

interface TaskProgress {
  id: string;
  title: string;
  description: string;
  progress: number;
  status: 'pending' | 'active' | 'complete' | 'error';
  estimatedTime?: number;
  actualTime?: number;
}

interface SystemInsight {
  id: string;
  type: 'info' | 'warning' | 'success' | 'error';
  title: string;
  message: string;
  timestamp: Date;
  actionable?: boolean;
  action?: () => void;
}

// Headless Agent Status Monitor
export function HeadlessAgentMonitor({ 
  agents = [],
  className = "",
  compact = false 
}: {
  agents: AgentStatus[];
  className?: string;
  compact?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [expandedAgent, setExpandedAgent] = useState<string | null>(null);

  // Make agent status readable by CopilotKit
  useCopilotReadable({
    description: "Current status of all AI agents in the system",
    value: {
      agents: agents.map(agent => ({
        name: agent.name,
        status: agent.status,
        progress: agent.progress,
        message: agent.message
      })),
      activeAgents: agents.filter(a => a.status === 'working' || a.status === 'thinking').length,
      completedAgents: agents.filter(a => a.status === 'complete').length,
      totalAgents: agents.length
    }
  });

  // CopilotKit action for agent control
  useCopilotAction({
    name: "controlAgent",
    description: "Control agent execution (pause, resume, restart)",
    parameters: [
      { name: "agentId", type: "string", description: "ID of the agent to control" },
      { name: "action", type: "string", description: "Action to perform", enum: ["pause", "resume", "restart", "stop"] }
    ],
    handler: async ({ agentId, action }) => {
      console.log(`Agent control: ${action} on ${agentId}`);
      return `Agent ${agentId} ${action} command executed`;
    },
  });

  const getStatusIcon = (status: AgentStatus['status']) => {
    switch (status) {
      case 'thinking':
      case 'working':
        return <Loader2 className="w-4 h-4 animate-spin text-blue-500" />;
      case 'complete':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Clock className="w-4 h-4 text-muted-foreground" />;
    }
  };

  const getStatusColor = (status: AgentStatus['status']) => {
    switch (status) {
      case 'thinking':
      case 'working':
        return 'border-blue-500/20 bg-blue-500/5';
      case 'complete':
        return 'border-green-500/20 bg-green-500/5';
      case 'error':
        return 'border-red-500/20 bg-red-500/5';
      default:
        return 'border-border bg-background';
    }
  };

  if (!isVisible || agents.length === 0) {
    return null;
  }

  if (compact) {
    return (
      <div className={`flex items-center gap-2 ${className}`}>
        <Brain className="w-4 h-4 text-primary" />
        <div className="flex gap-1">
          {agents.map(agent => (
            <div
              key={agent.id}
              className={`w-2 h-2 rounded-full ${
                agent.status === 'working' || agent.status === 'thinking' ? 'bg-blue-500 animate-pulse' :
                agent.status === 'complete' ? 'bg-green-500' :
                agent.status === 'error' ? 'bg-red-500' :
                'bg-muted-foreground'
              }`}
              title={`${agent.name}: ${agent.status}`}
            />
          ))}
        </div>
        <span className="text-xs text-muted-foreground">
          {agents.filter(a => a.status === 'working' || a.status === 'thinking').length} active
        </span>
      </div>
    );
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            Agent Status Monitor
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        <AnimatePresence>
          {agents.map(agent => (
            <motion.div
              key={agent.id}
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className={`p-3 rounded-lg border ${getStatusColor(agent.status)}`}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  {getStatusIcon(agent.status)}
                  <span className="text-sm font-medium">{agent.name}</span>
                  <Badge variant="outline" className="text-xs">
                    {agent.status}
                  </Badge>
                </div>
                
                {agent.status === 'working' && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setExpandedAgent(
                      expandedAgent === agent.id ? null : agent.id
                    )}
                  >
                    {expandedAgent === agent.id ? <Minimize2 className="w-3 h-3" /> : <Maximize2 className="w-3 h-3" />}
                  </Button>
                )}
              </div>

              {agent.progress !== undefined && (
                <div className="mt-2">
                  <Progress value={agent.progress} className="h-1" />
                  <div className="flex justify-between text-xs text-muted-foreground mt-1">
                    <span>{agent.message || 'Processing...'}</span>
                    <span>{agent.progress}%</span>
                  </div>
                </div>
              )}

              {expandedAgent === agent.id && (
                <motion.div
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  className="mt-3 pt-3 border-t border-border/50"
                >
                  <div className="text-xs text-muted-foreground space-y-1">
                    <p>Last Update: {agent.lastUpdate.toLocaleTimeString()}</p>
                    {agent.message && <p>Status: {agent.message}</p>}
                  </div>
                </motion.div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Headless Task Progress Tracker
export function HeadlessTaskTracker({
  tasks = [],
  className = "",
  showEstimates = true
}: {
  tasks: TaskProgress[];
  className?: string;
  showEstimates?: boolean;
}) {
  const [isVisible, setIsVisible] = useState(true);

  // Make task progress readable by CopilotKit
  useCopilotReadable({
    description: "Current progress of all active tasks",
    value: {
      tasks: tasks.map(task => ({
        title: task.title,
        progress: task.progress,
        status: task.status,
        estimatedTime: task.estimatedTime
      })),
      activeTasks: tasks.filter(t => t.status === 'active').length,
      completedTasks: tasks.filter(t => t.status === 'complete').length,
      totalProgress: tasks.length > 0 ? tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length : 0
    }
  });

  const getStatusColor = (status: TaskProgress['status']) => {
    switch (status) {
      case 'active':
        return 'text-blue-500';
      case 'complete':
        return 'text-green-500';
      case 'error':
        return 'text-red-500';
      default:
        return 'text-muted-foreground';
    }
  };

  if (!isVisible || tasks.length === 0) {
    return null;
  }

  const overallProgress = tasks.length > 0 
    ? tasks.reduce((sum, task) => sum + task.progress, 0) / tasks.length 
    : 0;

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-primary" />
            Task Progress
          </div>
          <div className="flex items-center gap-2">
            <span className="text-xs text-muted-foreground">
              {Math.round(overallProgress)}% Complete
            </span>
            <Button
              variant="ghost"
              size="sm"
              onClick={() => setIsVisible(false)}
            >
              <EyeOff className="w-4 h-4" />
            </Button>
          </div>
        </CardTitle>
        
        <Progress value={overallProgress} className="h-2" />
      </CardHeader>

      <CardContent className="space-y-3">
        <AnimatePresence>
          {tasks.map(task => (
            <motion.div
              key={task.id}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: 20 }}
              className="space-y-2"
            >
              <div className="flex items-center justify-between">
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium truncate">{task.title}</h4>
                  <p className="text-xs text-muted-foreground truncate">
                    {task.description}
                  </p>
                </div>
                
                <div className="flex items-center gap-2 ml-2">
                  <Badge 
                    variant="outline" 
                    className={`text-xs ${getStatusColor(task.status)}`}
                  >
                    {task.status}
                  </Badge>
                  <span className="text-xs font-mono">
                    {task.progress}%
                  </span>
                </div>
              </div>

              <Progress value={task.progress} className="h-1" />

              {showEstimates && (task.estimatedTime || task.actualTime) && (
                <div className="flex justify-between text-xs text-muted-foreground">
                  {task.estimatedTime && (
                    <span>Est: {task.estimatedTime}s</span>
                  )}
                  {task.actualTime && (
                    <span>Actual: {task.actualTime}s</span>
                  )}
                </div>
              )}
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Headless System Insights
export function HeadlessSystemInsights({
  insights = [],
  className = "",
  maxInsights = 5
}: {
  insights: SystemInsight[];
  className?: string;
  maxInsights?: number;
}) {
  const [isVisible, setIsVisible] = useState(true);
  const [dismissedInsights, setDismissedInsights] = useState<Set<string>>(new Set());

  // Make insights readable by CopilotKit
  useCopilotReadable({
    description: "System insights and recommendations",
    value: {
      insights: insights.map(insight => ({
        type: insight.type,
        title: insight.title,
        message: insight.message,
        actionable: insight.actionable
      })),
      totalInsights: insights.length,
      actionableInsights: insights.filter(i => i.actionable).length
    }
  });

  const visibleInsights = insights
    .filter(insight => !dismissedInsights.has(insight.id))
    .slice(0, maxInsights);

  const getInsightIcon = (type: SystemInsight['type']) => {
    switch (type) {
      case 'success':
        return <CheckCircle className="w-4 h-4 text-green-500" />;
      case 'warning':
        return <AlertCircle className="w-4 h-4 text-yellow-500" />;
      case 'error':
        return <AlertCircle className="w-4 h-4 text-red-500" />;
      default:
        return <Brain className="w-4 h-4 text-blue-500" />;
    }
  };

  const getInsightColor = (type: SystemInsight['type']) => {
    switch (type) {
      case 'success':
        return 'border-green-500/20 bg-green-500/5';
      case 'warning':
        return 'border-yellow-500/20 bg-yellow-500/5';
      case 'error':
        return 'border-red-500/20 bg-red-500/5';
      default:
        return 'border-blue-500/20 bg-blue-500/5';
    }
  };

  const dismissInsight = (insightId: string) => {
    setDismissedInsights(prev => new Set([...Array.from(prev), insightId]));
  };

  if (!isVisible || visibleInsights.length === 0) {
    return null;
  }

  return (
    <Card className={`${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center justify-between text-sm">
          <div className="flex items-center gap-2">
            <Brain className="w-4 h-4 text-primary" />
            System Insights
          </div>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
          >
            <EyeOff className="w-4 h-4" />
          </Button>
        </CardTitle>
      </CardHeader>

      <CardContent className="space-y-2">
        <AnimatePresence>
          {visibleInsights.map(insight => (
            <motion.div
              key={insight.id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              className={`p-3 rounded-lg border ${getInsightColor(insight.type)}`}
            >
              <div className="flex items-start gap-3">
                {getInsightIcon(insight.type)}
                
                <div className="flex-1 min-w-0">
                  <h4 className="text-sm font-medium">{insight.title}</h4>
                  <p className="text-xs text-muted-foreground mt-1">
                    {insight.message}
                  </p>
                  
                  <div className="flex items-center justify-between mt-2">
                    <span className="text-xs text-muted-foreground">
                      {insight.timestamp.toLocaleTimeString()}
                    </span>
                    
                    <div className="flex gap-1">
                      {insight.actionable && insight.action && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={insight.action}
                          className="text-xs h-6"
                        >
                          Take Action
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => dismissInsight(insight.id)}
                        className="text-xs h-6"
                      >
                        ×
                      </Button>
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </CardContent>
    </Card>
  );
}

// Export types for external use
export type { AgentStatus, TaskProgress, SystemInsight };
