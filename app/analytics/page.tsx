'use client'

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useAuth } from '@/hooks/useAuth';
import { useRouter } from 'next/navigation';
import { 
  BarChart3, 
  TrendingUp, 
  Users, 
  MapPin, 
  Clock, 
  Target,
  MessageSquare,
  FileText,
  Zap,
  Brain,
  Activity,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react';
import {
  PageTransition,
  staggerContainer,
  staggerItem
} from '@/components/animations/AnimationSystem';

// Mock data for demonstration
const analyticsData = {
  overview: {
    totalResearches: 47,
    totalReports: 23,
    avgResearchTime: "12 min",
    successRate: "94%"
  },
  recentActivity: [
    {
      id: 1,
      type: "research",
      title: "Italian Restaurant - Downtown SF",
      timestamp: "2 hours ago",
      status: "completed",
      agents: ["Demographics", "Competitors", "Traffic"]
    },
    {
      id: 2,
      type: "report",
      title: "Coffee Shop Market Analysis",
      timestamp: "5 hours ago",
      status: "generated",
      agents: ["Sites", "Zoning"]
    },
    {
      id: 3,
      type: "research",
      title: "Fast Casual - Austin TX",
      timestamp: "1 day ago",
      status: "in_progress",
      agents: ["Demographics", "Competitors"]
    }
  ],
  agentPerformance: [
    { name: "Demographics Agent", usage: 89, avgTime: "3.2 min", accuracy: "96%" },
    { name: "Competitor Agent", usage: 76, avgTime: "4.1 min", accuracy: "94%" },
    { name: "Traffic Agent", usage: 65, avgTime: "2.8 min", accuracy: "92%" },
    { name: "Sites Agent", usage: 54, avgTime: "5.3 min", accuracy: "98%" },
    { name: "Zoning Agent", usage: 43, avgTime: "6.1 min", accuracy: "99%" }
  ],
  researchTrends: [
    { month: "Jan", researches: 12, reports: 8 },
    { month: "Feb", researches: 19, reports: 12 },
    { month: "Mar", researches: 23, reports: 15 },
    { month: "Apr", researches: 31, reports: 18 },
    { month: "May", researches: 47, reports: 23 }
  ]
};

function Analytics() {
  const { isAuthenticated } = useAuth();
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!isAuthenticated) {
      router.push('/auth/signin');
      return;
    }
    
    // Simulate loading
    const timer = setTimeout(() => setIsLoading(false), 1000);
    return () => clearTimeout(timer);
  }, [isAuthenticated, router]);

  if (!isAuthenticated) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center space-y-4">
          <RefreshCw className="w-8 h-8 animate-spin mx-auto text-primary" />
          <p className="text-muted-foreground">Loading analytics...</p>
        </div>
      </div>
    );
  }

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Header */}
        <div className="border-b border-border bg-background/95 backdrop-blur-lg sticky top-0 z-40">
          <div className="max-w-7xl mx-auto px-4 py-6">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
                <p className="text-muted-foreground mt-1">
                  Track your research performance and insights
                </p>
              </div>
              <div className="flex items-center space-x-3">
                <Button size="sm">
                  <Download size={16} className="mr-2" />
                  Export Data
                </Button>
                <Button size="sm">
                  <Filter size={16} className="mr-2" />
                  Filter
                </Button>
              </div>
            </div>
          </div>
        </div>

        <div className="max-w-7xl mx-auto px-4 py-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* Overview Cards */}
            <motion.div variants={staggerItem}>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {[
                  {
                    title: "Total Researches",
                    value: analyticsData.overview.totalResearches,
                    icon: Brain,
                    color: "text-blue-600",
                    bgColor: "bg-blue-100",
                    change: "+12%"
                  },
                  {
                    title: "Reports Generated",
                    value: analyticsData.overview.totalReports,
                    icon: FileText,
                    color: "text-green-600",
                    bgColor: "bg-green-100",
                    change: "+8%"
                  },
                  {
                    title: "Avg Research Time",
                    value: analyticsData.overview.avgResearchTime,
                    icon: Clock,
                    color: "text-purple-600",
                    bgColor: "bg-purple-100",
                    change: "-15%"
                  },
                  {
                    title: "Success Rate",
                    value: analyticsData.overview.successRate,
                    icon: Target,
                    color: "text-orange-600",
                    bgColor: "bg-orange-100",
                    change: "+2%"
                  }
                ].map((metric, index) => {
                  const IconComponent = metric.icon;
                  return (
                    <Card key={metric.title} className="hover:shadow-lg transition-shadow">
                      <CardContent className="p-6">
                        <div className="flex items-center justify-between">
                          <div>
                            <p className="text-sm text-muted-foreground">{metric.title}</p>
                            <p className="text-2xl font-bold mt-1">{metric.value}</p>
                            <Badge className={`mt-2 text-xs ${metric.change.startsWith('+') ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'}`}>
                              {metric.change} from last month
                            </Badge>
                          </div>
                          <div className={`w-12 h-12 rounded-lg ${metric.bgColor} flex items-center justify-center`}>
                            <IconComponent size={24} className={metric.color} />
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  );
                })}
              </div>
            </motion.div>

            {/* Main Content Tabs */}
            <motion.div variants={staggerItem}>
              <Tabs defaultValue="activity" className="space-y-6">
                <TabsList className="grid w-full grid-cols-4">
                  <TabsTrigger value="activity">Recent Activity</TabsTrigger>
                  <TabsTrigger value="agents">Agent Performance</TabsTrigger>
                  <TabsTrigger value="trends">Research Trends</TabsTrigger>
                  <TabsTrigger value="insights">Insights</TabsTrigger>
                </TabsList>

                {/* Recent Activity Tab */}
                <TabsContent value="activity" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Activity size={20} />
                        <span>Recent Activity</span>
                      </CardTitle>
                      <CardDescription>
                        Your latest research sessions and generated reports
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.recentActivity.map((activity) => (
                          <div key={activity.id} className="flex items-center justify-between p-4 border border-border rounded-lg hover:bg-muted/50 transition-colors">
                            <div className="flex items-center space-x-4">
                              <div className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                                activity.type === 'research' ? 'bg-blue-100' : 'bg-green-100'
                              }`}>
                                {activity.type === 'research' ? (
                                  <Brain size={20} className="text-blue-600" />
                                ) : (
                                  <FileText size={20} className="text-green-600" />
                                )}
                              </div>
                              <div>
                                <h4 className="font-medium">{activity.title}</h4>
                                <p className="text-sm text-muted-foreground">{activity.timestamp}</p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-3">
                              <div className="flex flex-wrap gap-1">
                                {activity.agents.map((agent) => (
                                  <Badge key={agent} className="text-xs bg-secondary text-secondary-foreground">
                                    {agent}
                                  </Badge>
                                ))}
                              </div>
                              <Badge className={`${
                                activity.status === 'completed' ? 'bg-green-100 text-green-800' :
                                activity.status === 'generated' ? 'bg-blue-100 text-blue-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                                {activity.status.replace('_', ' ')}
                              </Badge>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Agent Performance Tab */}
                <TabsContent value="agents" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users size={20} />
                        <span>Agent Performance</span>
                      </CardTitle>
                      <CardDescription>
                        Performance metrics for each AI agent
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {analyticsData.agentPerformance.map((agent, index) => (
                          <div key={agent.name} className="p-4 border border-border rounded-lg">
                            <div className="flex items-center justify-between mb-3">
                              <h4 className="font-medium">{agent.name}</h4>
                              <Badge className="bg-primary/10 text-primary">
                                {agent.accuracy} accuracy
                              </Badge>
                            </div>
                            <div className="grid grid-cols-3 gap-4 text-sm">
                              <div>
                                <p className="text-muted-foreground">Usage</p>
                                <div className="flex items-center space-x-2 mt-1">
                                  <div className="flex-1 bg-muted rounded-full h-2">
                                    <div 
                                      className="bg-primary h-2 rounded-full transition-all duration-500"
                                      style={{ width: `${agent.usage}%` }}
                                    />
                                  </div>
                                  <span className="font-medium">{agent.usage}%</span>
                                </div>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Avg Time</p>
                                <p className="font-medium mt-1">{agent.avgTime}</p>
                              </div>
                              <div>
                                <p className="text-muted-foreground">Accuracy</p>
                                <p className="font-medium mt-1">{agent.accuracy}</p>
                              </div>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Research Trends Tab */}
                <TabsContent value="trends" className="space-y-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <TrendingUp size={20} />
                        <span>Research Trends</span>
                      </CardTitle>
                      <CardDescription>
                        Monthly research and report generation trends
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-6">
                        {analyticsData.researchTrends.map((trend, index) => (
                          <div key={trend.month} className="flex items-center justify-between p-4 border border-border rounded-lg">
                            <div className="flex items-center space-x-4">
                              <div className="w-12 h-12 rounded-lg bg-primary/10 flex items-center justify-center">
                                <Calendar size={20} className="text-primary" />
                              </div>
                              <div>
                                <h4 className="font-medium">{trend.month} 2024</h4>
                                <p className="text-sm text-muted-foreground">
                                  {trend.researches} researches, {trend.reports} reports
                                </p>
                              </div>
                            </div>
                            <div className="text-right">
                              <p className="text-2xl font-bold">{trend.researches}</p>
                              <p className="text-sm text-muted-foreground">researches</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </CardContent>
                  </Card>
                </TabsContent>

                {/* Insights Tab */}
                <TabsContent value="insights" className="space-y-6">
                  <div className="grid md:grid-cols-2 gap-6">
                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Zap size={20} />
                          <span>Key Insights</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                          <h4 className="font-medium text-blue-900">Most Active Research Type</h4>
                          <p className="text-sm text-blue-700 mt-1">
                            Demographics analysis is your most used research type (89% usage)
                          </p>
                        </div>
                        <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                          <h4 className="font-medium text-green-900">Efficiency Improvement</h4>
                          <p className="text-sm text-green-700 mt-1">
                            Your average research time has decreased by 15% this month
                          </p>
                        </div>
                        <div className="p-4 bg-purple-50 border border-purple-200 rounded-lg">
                          <h4 className="font-medium text-purple-900">Peak Usage Time</h4>
                          <p className="text-sm text-purple-700 mt-1">
                            Most research sessions happen between 10 AM - 2 PM
                          </p>
                        </div>
                      </CardContent>
                    </Card>

                    <Card>
                      <CardHeader>
                        <CardTitle className="flex items-center space-x-2">
                          <Target size={20} />
                          <span>Recommendations</span>
                        </CardTitle>
                      </CardHeader>
                      <CardContent className="space-y-4">
                        <div className="p-4 border border-border rounded-lg">
                          <h4 className="font-medium">Explore Zoning Agent</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            You've used the Zoning Agent least. It has 99% accuracy and could enhance your research.
                          </p>
                        </div>
                        <div className="p-4 border border-border rounded-lg">
                          <h4 className="font-medium">Optimize Research Timing</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            Consider scheduling research during off-peak hours for faster response times.
                          </p>
                        </div>
                        <div className="p-4 border border-border rounded-lg">
                          <h4 className="font-medium">Report Generation</h4>
                          <p className="text-sm text-muted-foreground mt-1">
                            You generate reports for 49% of your research. Consider increasing this for better insights.
                          </p>
                        </div>
                      </CardContent>
                    </Card>
                  </div>
                </TabsContent>
              </Tabs>
            </motion.div>
          </motion.div>
        </div>
      </div>
    </PageTransition>
  );
}

export default Analytics;
