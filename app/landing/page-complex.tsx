'use client'

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { motion, useScroll, useTransform } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useMutation, useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';
import type { User } from '@shared/schema';
import { MapPin, MessageSquare, BarChart3, ArrowRight, Loader2, Brain, Target, Building, Shield, Users, TrendingUp, Zap, Sparkles, ChevronDown, Star, CheckCircle, Play, DollarSign, Clock, Search, Send } from 'lucide-react';
import { BiteBaseLogoHero } from '@/components/brand/BiteBaseLogo';
import {
  AnimatedContainer,
  PageTransition,
  FloatingElement,
  MagneticButton,
  Typewriter,
  MorphingBackground,
  RevealText,
  staggerContainer,
  staggerItem
} from '@/components/animations/AnimationSystem';

// Agent showcase data
const AGENT_SHOWCASE = [
  {
    icon: Brain,
    name: "Research Coordinator",
    description: "Orchestrates comprehensive market analysis",
    color: "bg-primary",
    features: ["Multi-agent coordination", "Strategic insights", "Actionable recommendations"]
  },
  {
    icon: Users,
    name: "Demographics Agent",
    description: "Analyzes target market and population data",
    color: "bg-blue-500",
    features: ["Population analysis", "Income demographics", "Consumer behavior"]
  },
  {
    icon: Target,
    name: "Competitor Agent",
    description: "Researches competitive landscape",
    color: "bg-red-500",
    features: ["Competitor mapping", "Market gaps", "Positioning strategy"]
  },
  {
    icon: BarChart3,
    name: "Traffic Agent",
    description: "Studies foot traffic and visitor patterns",
    color: "bg-green-500",
    features: ["Peak hour analysis", "Visitor demographics", "Seasonal trends"]
  },
  {
    icon: Building,
    name: "Sites Agent",
    description: "Recommends optimal locations",
    color: "bg-purple-500",
    features: ["Site scoring", "ROI projections", "Risk assessment"]
  },
  {
    icon: Shield,
    name: "Zoning Agent",
    description: "Ensures regulatory compliance",
    color: "bg-orange-500",
    features: ["Permit requirements", "Zoning compliance", "Timeline estimation"]
  }
];

const TESTIMONIALS = [
  {
    name: "Sarah Chen",
    role: "Restaurant Owner",
    content: "BiteBase Intelligence helped me find the perfect location for my cafe. The AI agents provided insights I never would have discovered on my own.",
    rating: 5
  },
  {
    name: "Marcus Rodriguez",
    role: "Franchise Developer",
    content: "The multi-agent analysis saved us months of research. We opened 3 successful locations using their recommendations.",
    rating: 5
  },
  {
    name: "Emily Watson",
    role: "Food Entrepreneur",
    content: "Incredible platform! The real-time market analysis and competitor insights gave us a huge competitive advantage.",
    rating: 5
  }
];

export default function Landing() {
  const router = useRouter();
  const [chatInput, setChatInput] = useState('');
  const [isScrolled, setIsScrolled] = useState(false);
  const { isAuthenticated } = useAuth();

  // Handle scroll effect for header
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Create new chat session mutation
  const createSessionMutation = useMutation({
    mutationFn: async (initialQuery: string) => {
      const response = await apiRequest('POST', '/api/chat/sessions', {
        title: `Research: ${initialQuery.slice(0, 50)}${initialQuery.length > 50 ? '...' : ''}`,
        location: 'San Francisco, CA', // Default location
        status: 'active'
      });
      return response.json();
    },
    onSuccess: (session: any) => {
      router.push(`/chat/${session.id}?q=${encodeURIComponent(chatInput)}`);
    }
  });

  const handleStartChat = () => {
    if (!chatInput.trim()) return;
    
    if (!isAuthenticated) {
      // Redirect to login
      window.location.href = '/api/login';
      return;
    }

    createSessionMutation.mutate(chatInput);
  };



  const isLoading = createSessionMutation.isPending;

  return (
    <PageTransition>
      <div className="min-h-screen bg-background relative overflow-hidden" data-testid="landing-page">
        {/* Enhanced morphing background */}
        <MorphingBackground />
        
      {/* Navigation is now handled by MainNavigation component */}

      {/* Enhanced Hero Section */}
      <div className="min-h-screen flex items-center justify-center relative overflow-hidden pt-16">
        {/* Animated background gradient */}
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10 animate-pulse" />

        {/* Floating elements */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute top-1/4 left-1/4 w-32 h-32 bg-primary/5 rounded-full blur-3xl animate-bounce" style={{ animationDelay: '0s', animationDuration: '6s' }} />
          <div className="absolute top-3/4 right-1/4 w-24 h-24 bg-accent/5 rounded-full blur-2xl animate-bounce" style={{ animationDelay: '2s', animationDuration: '8s' }} />
          <div className="absolute top-1/2 left-3/4 w-20 h-20 bg-secondary/5 rounded-full blur-xl animate-bounce" style={{ animationDelay: '4s', animationDuration: '7s' }} />
        </div>
        
        {/* Enhanced Main content with animations */}
        <div className="relative z-10 text-center max-w-6xl mx-auto px-4 mt-8">
          <motion.div
            variants={staggerContainer}
            initial="hidden"
            animate="visible"
            className="space-y-8"
          >
            {/* BiteBase Logo Hero */}
            <motion.div variants={staggerItem}>
              <BiteBaseLogoHero />
            </motion.div>

            {/* Animated Badge */}
            <motion.div
              variants={staggerItem}
              className="flex justify-center"
            >
              <FloatingElement>
                <Badge className="px-4 py-2 text-sm font-medium bg-primary/10 text-primary border-primary/20 shadow-lg">
                  <motion.div
                    animate={{ rotate: [0, 360] }}
                    transition={{ duration: 3, repeat: Infinity, ease: "linear" }}
                  >
                    <Sparkles size={16} className="mr-2" />
                  </motion.div>
                  Multi-Agent AI Research Platform
                </Badge>
              </FloatingElement>
            </motion.div>

            {/* Animated Main headline */}
            <motion.div variants={staggerItem}>
              <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight" data-testid="hero-title">
                <motion.span
                  className="block mb-2"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.2 }}
                >
                  AI-Powered
                </motion.span>
                <motion.span
                  className="bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent"
                  initial={{ opacity: 0, y: 50 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.8, delay: 0.4 }}
                >
                  <Typewriter
                    text="Restaurant Intelligence"
                    delay={600}
                    speed={100}
                  />
                </motion.span>
              </h1>
            </motion.div>

            <motion.div variants={staggerItem}>
              <RevealText className="text-lg md:text-xl text-muted-foreground mb-8 max-w-4xl mx-auto leading-relaxed">
                Harness the power of specialized AI agents to analyze demographics, competitors, foot traffic, and zoning compliance. Find the perfect location for your restaurant or cafe with data-driven insights.
              </RevealText>
            </motion.div>

            {/* PROMINENT SEARCH FIELD - Main CTA */}
            <motion.div
              variants={staggerItem}
              className="max-w-4xl mx-auto mb-8"
              data-testid="hero-search-panel"
            >
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 1.0 }}
              >
                {/* Animated background glow */}
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/30 via-blue-500/30 to-purple-500/30 rounded-3xl blur-2xl"
                  animate={{
                    background: [
                      "linear-gradient(45deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))",
                      "linear-gradient(135deg, rgba(147, 51, 234, 0.3), rgba(59, 130, 246, 0.3))",
                      "linear-gradient(225deg, rgba(59, 130, 246, 0.3), rgba(147, 51, 234, 0.3))"
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />

                {/* Main search container */}
                <motion.div
                  className="relative bg-background/90 backdrop-blur-xl border-2 border-primary/20 rounded-3xl p-8 shadow-2xl hover:shadow-3xl transition-all duration-300"
                  whileHover={{ scale: 1.02, borderColor: "rgba(59, 130, 246, 0.4)" }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="text-center mb-6">
                    <h2 className="text-2xl md:text-3xl font-bold mb-2 bg-gradient-to-r from-primary to-blue-600 bg-clip-text text-transparent">
                      Start Your Market Research
                    </h2>
                    <p className="text-muted-foreground">
                      Tell our AI agents about your restaurant concept and location
                    </p>
                  </div>

                  <div className="flex flex-col md:flex-row items-center space-y-4 md:space-y-0 md:space-x-4">
                    <div className="flex-1 w-full relative">
                      <motion.div
                        animate={{ scale: [1, 1.1, 1] }}
                        transition={{ duration: 2, repeat: Infinity }}
                      >
                        <Search className="absolute left-6 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={24} />
                      </motion.div>
                      <Input
                        type="text"
                        placeholder="I want to open an Italian restaurant in downtown San Francisco with a $15,000 monthly budget..."
                        value={chatInput}
                        onChange={(e) => setChatInput(e.target.value)}
                        onKeyDown={(e) => e.key === 'Enter' && handleStartChat()}
                        className="w-full pl-16 pr-6 py-6 bg-background/80 border-2 border-border/50 rounded-2xl text-foreground placeholder-muted-foreground text-lg focus:border-primary/50 focus:ring-4 focus:ring-primary/20 transition-all shadow-inner"
                        disabled={isLoading}
                        data-testid="hero-search-input"
                      />
                    </div>

                    <motion.div
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <Button
                        onClick={handleStartChat}
                        disabled={!chatInput.trim() || isLoading}
                        className="px-8 py-6 text-lg font-semibold bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary shadow-lg hover:shadow-xl transition-all duration-300 rounded-2xl"
                        data-testid="hero-search-button"
                      >
                        {isLoading ? (
                          <Loader2 className="w-6 h-6 animate-spin mr-2" />
                        ) : (
                          <Send className="w-6 h-6 mr-2" />
                        )}
                        {isLoading ? 'Starting Research...' : 'Start Research'}
                      </Button>
                    </motion.div>
                  </div>

                  {/* Quick suggestion chips */}
                  <div className="mt-6 flex flex-wrap justify-center gap-2">
                    {[
                      "Coffee shop in Brooklyn",
                      "Fast casual in Austin",
                      "Fine dining in Miami",
                      "Food truck locations"
                    ].map((suggestion, index) => (
                      <motion.button
                        key={index}
                        onClick={() => setChatInput(suggestion)}
                        className="px-4 py-2 text-sm bg-muted/50 hover:bg-primary/10 border border-border/50 hover:border-primary/30 rounded-full transition-all duration-200 hover:scale-105"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        {suggestion}
                      </motion.button>
                    ))}
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Animated Agent showcase mini-grid */}
            <motion.div
              variants={staggerItem}
              className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-12 max-w-4xl mx-auto"
            >
              {AGENT_SHOWCASE.map((agent, index) => {
                const IconComponent = agent.icon;
                return (
                  <motion.div
                    key={agent.name}
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    transition={{
                      duration: 0.6,
                      delay: 0.8 + index * 0.1,
                      ease: [0.22, 1, 0.36, 1]
                    }}
                    whileHover={{
                      scale: 1.05,
                      y: -5,
                      transition: { duration: 0.2 }
                    }}
                    className="flex flex-col items-center p-4 rounded-xl bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 cursor-pointer group"
                  >
                    <motion.div
                      className={`w-12 h-12 ${agent.color} rounded-xl flex items-center justify-center mb-2 shadow-lg group-hover:shadow-xl transition-shadow`}
                      whileHover={{ rotate: [0, -10, 10, 0] }}
                      transition={{ duration: 0.5 }}
                    >
                      <IconComponent size={20} className="text-white" />
                    </motion.div>
                    <span className="text-xs font-medium text-center group-hover:text-primary transition-colors">
                      {agent.name.replace(' Agent', '')}
                    </span>
                  </motion.div>
                );
              })}
            </motion.div>

            {/* Enhanced Animated Chat Input */}
            <motion.div
              variants={staggerItem}
              className="max-w-3xl mx-auto mb-12"
              data-testid="chat-input-panel"
            >
              <motion.div
                className="relative"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.8, delay: 1.2 }}
              >
                <motion.div
                  className="absolute inset-0 bg-gradient-to-r from-primary/20 via-blue-500/20 to-purple-500/20 rounded-2xl blur-xl"
                  animate={{
                    background: [
                      "linear-gradient(45deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))",
                      "linear-gradient(135deg, rgba(147, 51, 234, 0.2), rgba(59, 130, 246, 0.2))",
                      "linear-gradient(225deg, rgba(59, 130, 246, 0.2), rgba(147, 51, 234, 0.2))"
                    ]
                  }}
                  transition={{ duration: 4, repeat: Infinity, ease: "linear" }}
                />
                <motion.div
                  className="relative bg-background/80 backdrop-blur-xl border border-border/50 rounded-2xl p-6 shadow-2xl hover:shadow-3xl transition-shadow duration-300"
                  whileHover={{ scale: 1.02 }}
                  transition={{ duration: 0.2 }}
                >
                  <div className="flex items-center space-x-4">
                    <div className="flex-1">
                      <div className="relative">
                        <motion.div
                          animate={{ scale: [1, 1.1, 1] }}
                          transition={{ duration: 2, repeat: Infinity }}
                        >
                          <MessageSquare className="absolute left-4 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                        </motion.div>
                        <Input
                          type="text"
                          placeholder="I want to open an Italian restaurant in downtown San Francisco..."
                          value={chatInput}
                          onChange={(e) => setChatInput(e.target.value)}
                          onKeyDown={(e) => e.key === 'Enter' && handleStartChat()}
                          className="w-full pl-12 pr-4 py-4 bg-background/50 border border-border/50 rounded-xl text-foreground placeholder-muted-foreground text-lg focus:border-primary/50 focus:ring-2 focus:ring-primary/20 transition-all"
                          disabled={isLoading}
                          data-testid="chat-input"
                        />
                      </div>
                    </div>
                    <MagneticButton
                      onClick={handleStartChat}
                      className="inline-block"
                    >
                      <Button
                        disabled={!chatInput.trim() || isLoading}
                        className="px-8 py-4 bg-gradient-to-r from-primary to-blue-600 hover:from-primary/90 hover:to-blue-600/90 text-white rounded-xl font-semibold text-lg shadow-lg hover:shadow-xl transition-all duration-300 flex items-center space-x-2 relative overflow-hidden group"
                        data-testid="start-research-button"
                      >
                        <motion.div
                          className="absolute inset-0 bg-gradient-to-r from-white/20 to-transparent"
                          initial={{ x: '-100%' }}
                          whileHover={{ x: '100%' }}
                          transition={{ duration: 0.6 }}
                        />
                        {isLoading ? (
                          <Loader2 className="w-4 h-4 animate-spin" />
                        ) : (
                          <motion.div
                            whileHover={{ x: 5 }}
                            transition={{ duration: 0.2 }}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </motion.div>
                        )}
                        <span>{isLoading ? 'Starting...' : 'Start Research'}</span>
                      </Button>
                    </MagneticButton>
                  </div>
                </motion.div>
              </motion.div>
            </motion.div>

            {/* Enhanced Animated Feature highlights */}
            <motion.div
              variants={staggerItem}
              className="grid md:grid-cols-3 gap-8 mt-16"
            >
              <AnimatedContainer variant="fadeInUp" delay={1.4}>
                <Card className="bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl group" data-testid="feature-conversations">
                  <CardContent className="p-8">
                    <FloatingElement>
                      <div className="w-16 h-16 bg-gradient-to-br from-primary to-blue-600 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                        <MessageSquare className="text-white" size={24} />
                      </div>
                    </FloatingElement>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Multi-Agent Conversations</h3>
                    <p className="text-muted-foreground leading-relaxed">Chat with specialized AI agents that collaborate to provide comprehensive market research insights in real-time.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge className="text-xs bg-secondary text-secondary-foreground">Natural Language</Badge>
                      <Badge className="text-xs bg-secondary text-secondary-foreground">Real-time Analysis</Badge>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedContainer>

              <AnimatedContainer variant="fadeInUp" delay={1.6}>
                <Card className="bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl group" data-testid="feature-maps">
                  <CardContent className="p-8">
                    <FloatingElement>
                      <div className="w-16 h-16 bg-gradient-to-br from-green-500 to-blue-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                        <MapPin className="text-white" size={24} />
                      </div>
                    </FloatingElement>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Interactive Map Canvas</h3>
                    <p className="text-muted-foreground leading-relaxed">Dynamic map visualization with agent-driven layers showing demographics, competitors, traffic patterns, and opportunities.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge className="text-xs bg-secondary text-secondary-foreground">Live Sync</Badge>
                      <Badge className="text-xs bg-secondary text-secondary-foreground">Dynamic Layers</Badge>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedContainer>

              <AnimatedContainer variant="fadeInUp" delay={1.8}>
                <Card className="bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-xl group" data-testid="feature-reports">
                  <CardContent className="p-8">
                    <FloatingElement>
                      <div className="w-16 h-16 bg-gradient-to-br from-purple-500 to-pink-500 rounded-2xl flex items-center justify-center mb-6 shadow-lg group-hover:shadow-xl transition-shadow">
                        <BarChart3 className="text-white" size={24} />
                      </div>
                    </FloatingElement>
                    <h3 className="text-xl font-bold mb-3 group-hover:text-primary transition-colors">Intelligent Reports</h3>
                    <p className="text-muted-foreground leading-relaxed">Comprehensive analysis reports with actionable recommendations, market insights, and data-driven location scoring.</p>
                    <div className="mt-4 flex flex-wrap gap-2">
                      <Badge className="text-xs bg-secondary text-secondary-foreground">PDF Export</Badge>
                      <Badge className="text-xs bg-secondary text-secondary-foreground">Actionable Insights</Badge>
                    </div>
                  </CardContent>
                </Card>
              </AnimatedContainer>
            </motion.div>

            {/* Enhanced Demo suggestion chips */}
            {!isAuthenticated && (
              <motion.div variants={staggerItem} className="mt-16">
                <div className="text-center mb-8">
                  <h3 className="text-2xl font-bold mb-4">Try These Sample Queries</h3>
                  <p className="text-muted-foreground">See how our AI agents work together to provide comprehensive market insights</p>
                </div>
                <div className="grid md:grid-cols-2 gap-4 max-w-4xl mx-auto">
                  {[
                    {
                      query: "I want to open an Italian restaurant in downtown San Francisco with a $15,000 monthly budget",
                      agents: ["Demographics", "Competitors", "Sites", "Zoning"],
                      icon: Building
                    },
                    {
                      query: "Show me high foot traffic areas with low coffee shop competition in Mission District",
                      agents: ["Traffic", "Competitors", "Demographics"],
                      icon: BarChart3
                    },
                    {
                      query: "Analyze the best locations for a family-friendly restaurant near schools and parks",
                      agents: ["Demographics", "Sites", "Traffic"],
                      icon: Users
                    },
                    {
                      query: "Find locations with good parking and visibility for a fast-casual concept",
                      agents: ["Sites", "Traffic", "Zoning"],
                      icon: Target
                    }
                  ].map((suggestion, index) => {
                    const IconComponent = suggestion.icon;
                    return (
                      <Card
                        key={index}
                        className="p-6 cursor-pointer hover:border-primary/50 transition-all duration-300 hover:scale-105 hover:shadow-lg bg-background/50 backdrop-blur-sm"
                        onClick={() => setChatInput(suggestion.query)}
                        data-testid={`suggestion-card-${index}`}
                      >
                        <div className="flex items-start space-x-4">
                          <div className="w-12 h-12 bg-primary/10 rounded-xl flex items-center justify-center flex-shrink-0">
                            <IconComponent size={20} className="text-primary" />
                          </div>
                          <div className="flex-1">
                            <p className="text-sm font-medium mb-3 leading-relaxed">{suggestion.query}</p>
                            <div className="flex flex-wrap gap-1">
                              {suggestion.agents.map((agent) => (
                                <Badge key={agent} className="text-xs bg-secondary text-secondary-foreground">
                                  {agent}
                                </Badge>
                              ))}
                            </div>
                          </div>
                        </div>
                      </Card>
                    );
                  })}
                </div>
              </motion.div>
            )}
          </motion.div>
        </div>
      </div>

      {/* Agent Showcase Section */}
      <section className="py-24 bg-muted/30">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <Badge className="mb-4 bg-secondary text-secondary-foreground">
              <Brain size={16} className="mr-2" />
              Multi-Agent Intelligence
            </Badge>
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Meet Your AI Research Team
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              Six specialized agents work together to provide comprehensive market research insights for your restaurant venture.
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
            {AGENT_SHOWCASE.map((agent) => {
              const IconComponent = agent.icon;
              return (
                <Card key={agent.name} className="p-8 hover:shadow-xl transition-all duration-300 hover:scale-105 bg-background/80 backdrop-blur-sm border border-border/50 hover:border-primary/50">
                  <CardHeader className="pb-4">
                    <div className={`w-16 h-16 ${agent.color} rounded-2xl flex items-center justify-center mb-4 shadow-lg`}>
                      <IconComponent size={24} className="text-white" />
                    </div>
                    <CardTitle className="text-xl">{agent.name}</CardTitle>
                    <CardDescription className="text-base">{agent.description}</CardDescription>
                  </CardHeader>
                  <CardContent className="pt-0">
                    <div className="space-y-2">
                      {agent.features.map((feature, idx) => (
                        <div key={idx} className="flex items-center space-x-2">
                          <CheckCircle size={16} className="text-primary flex-shrink-0" />
                          <span className="text-sm text-muted-foreground">{feature}</span>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </div>
      </section>

      {/* Testimonials Section */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Trusted by Restaurant Entrepreneurs
            </h2>
            <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
              See how BiteBase Intelligence has helped businesses find their perfect locations.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8">
            {TESTIMONIALS.map((testimonial, index) => (
              <Card key={index} className="p-8 bg-background/50 backdrop-blur-sm border border-border/50 hover:border-primary/50 transition-all duration-300 hover:scale-105">
                <CardContent className="pt-0">
                  <div className="flex items-center mb-4">
                    {[...Array(testimonial.rating)].map((_, i) => (
                      <Star key={i} size={16} className="text-yellow-500 fill-current" />
                    ))}
                  </div>
                  <p className="text-muted-foreground mb-6 leading-relaxed">"{testimonial.content}"</p>
                  <div>
                    <p className="font-semibold">{testimonial.name}</p>
                    <p className="text-sm text-muted-foreground">{testimonial.role}</p>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

        {/* Error handling */}
        {createSessionMutation.isError && (
          <motion.div
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 50 }}
            className="fixed bottom-4 right-4 bg-destructive text-destructive-foreground p-4 rounded-lg shadow-lg max-w-sm"
            data-testid="error-message"
          >
            <p className="text-sm font-medium">Failed to start chat session</p>
            <p className="text-xs mt-1">Please try again or contact support if the issue persists.</p>
          </motion.div>
        )}
      </div>
    </PageTransition>
  );
}
