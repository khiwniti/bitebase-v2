'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { MapPin, MessageSquare, BarChart3, ArrowRight, Brain, Target, Building, Users, TrendingUp, Search, Send } from 'lucide-react';

// Simplified agent showcase data
const AGENT_SHOWCASE = [
  {
    icon: Brain,
    name: "Research Coordinator",
    description: "Orchestrates comprehensive market analysis",
    color: "bg-primary"
  },
  {
    icon: Users,
    name: "Demographics Agent", 
    description: "Analyzes target market and population data",
    color: "bg-blue-500"
  },
  {
    icon: Target,
    name: "Competitor Agent",
    description: "Researches competitive landscape", 
    color: "bg-red-500"
  },
  {
    icon: BarChart3,
    name: "Traffic Agent",
    description: "Studies foot traffic and visitor patterns",
    color: "bg-green-500"
  },
  {
    icon: Building,
    name: "Sites Agent",
    description: "Recommends optimal locations",
    color: "bg-purple-500"
  }
];

export default function Landing() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');

  const handleStartResearch = () => {
    // Simple redirect to chat page with query parameter
    if (searchQuery.trim()) {
      router.push(`/chat?q=${encodeURIComponent(searchQuery)}`);
    } else {
      router.push('/chat');
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <div className="container mx-auto px-4 pt-16 pb-24">
        <div className="text-center max-w-4xl mx-auto">
          {/* Badge */}
          <div className="mb-8">
            <Badge className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20">
              Multi-Agent AI Research Platform
            </Badge>
          </div>

          {/* Main Headline */}
          <h1 className="text-4xl md:text-6xl font-bold mb-6 leading-tight">
            <span className="block mb-2">AI-Powered</span>
            <span className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
              Restaurant Intelligence
            </span>
          </h1>

          {/* Description */}
          <p className="text-lg md:text-xl text-muted-foreground mb-12 max-w-3xl mx-auto leading-relaxed">
            Harness the power of specialized AI agents to analyze demographics, competitors, foot traffic, and zoning compliance. Find the perfect location for your restaurant or cafe with data-driven insights.
          </p>

          {/* Search/CTA Section */}
          <div className="max-w-3xl mx-auto mb-16">
            <div className="relative bg-background border-2 border-primary/20 rounded-2xl p-6 shadow-lg">
              <div className="text-center mb-6">
                <h2 className="text-2xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                  Start Your Market Research
                </h2>
                <p className="text-muted-foreground">
                  Tell our AI agents about your restaurant concept and location
                </p>
              </div>

              <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                <div className="flex-1 w-full relative">
                  <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                  <Input
                    type="text"
                    placeholder="I want to open an Italian restaurant in downtown San Francisco..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && handleStartResearch()}
                    className="w-full pl-12 pr-4 py-3 text-base focus:border-primary/50 focus:ring-2 focus:ring-primary/20"
                    data-testid="hero-search-input"
                  />
                </div>

                <Button
                  onClick={handleStartResearch}
                  className="px-6 py-3 text-base font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary"
                  data-testid="hero-search-button"
                >
                  <Send className="w-5 h-5 mr-2" />
                  Start Research
                </Button>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* AI Agents Section */}
      <div className="bg-muted/30 py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Meet Your AI Research Team
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Our specialized agents work together to provide comprehensive market intelligence for your restaurant business.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 max-w-6xl mx-auto">
            {AGENT_SHOWCASE.map((agent, index) => {
              const IconComponent = agent.icon;
              return (
                <Card key={index} className="border-2 border-border/50 hover:border-primary/30 transition-colors">
                  <CardHeader className="text-center">
                    <div className={`w-16 h-16 rounded-2xl ${agent.color} flex items-center justify-center mx-auto mb-4`}>
                      <IconComponent className="w-8 h-8 text-white" />
                    </div>
                    <CardTitle className="text-xl">{agent.name}</CardTitle>
                    <CardDescription className="text-muted-foreground">
                      {agent.description}
                    </CardDescription>
                  </CardHeader>
                </Card>
              );
            })}
          </div>
        </div>
      </div>

      {/* How It Works Section */}
      <div className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              How It Works
            </h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Simple steps to get comprehensive market research for your restaurant location.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-4">
                <MessageSquare className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">1. Describe Your Concept</h3>
              <p className="text-muted-foreground">
                Tell us about your restaurant idea, budget, and preferred location
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-4">
                <Brain className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">2. AI Analysis</h3>
              <p className="text-muted-foreground">
                Our specialized agents analyze demographics, competition, and market conditions
              </p>
            </div>

            <div className="text-center">
              <div className="w-16 h-16 rounded-full bg-primary/10 border-2 border-primary/20 flex items-center justify-center mx-auto mb-4">
                <TrendingUp className="w-8 h-8 text-primary" />
              </div>
              <h3 className="text-xl font-semibold mb-2">3. Get Insights</h3>
              <p className="text-muted-foreground">
                Receive detailed reports with location recommendations and actionable insights
              </p>
            </div>
          </div>
        </div>
      </div>

      {/* Final CTA Section */}
      <div className="bg-primary/5 py-20">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl md:text-4xl font-bold mb-4">
            Ready to Find Your Perfect Location?
          </h2>
          <p className="text-lg text-muted-foreground mb-8 max-w-2xl mx-auto">
            Join hundreds of restaurant owners who have successfully launched their businesses with our AI-powered market research.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={() => router.push('/templates')}
              size="lg"
              className="px-8 py-4 text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary"
            >
              Browse Templates
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              onClick={() => router.push('/chat')}
              variant="outline"
              size="lg"
              className="px-8 py-4 text-lg font-semibold"
            >
              Start Custom Research
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}