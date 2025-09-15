'use client'

import { motion } from 'framer-motion';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { useRouter } from 'next/navigation';
import { 
  Brain, 
  Users, 
  MapPin, 
  BarChart3, 
  Shield, 
  Zap, 
  Target, 
  Building, 
  TrendingUp,
  MessageSquare,
  FileText,
  Globe,
  Clock,
  CheckCircle,
  ArrowRight,
  Sparkles
} from 'lucide-react';
import { BiteBaseLogo } from '@/components/brand/BiteBaseLogo';
import {
  AnimatedContainer,
  PageTransition,
  FloatingElement,
  RevealText,
  staggerContainer,
  staggerItem
} from '@/components/animations/AnimationSystem';

const features = [
  {
    category: "AI Intelligence",
    icon: Brain,
    color: "from-blue-500 to-purple-600",
    items: [
      {
        title: "Multi-Agent Collaboration",
        description: "Specialized AI agents work together to provide comprehensive market analysis",
        icon: Users,
        benefits: ["Real-time collaboration", "Specialized expertise", "Comprehensive insights"]
      },
      {
        title: "Deep Research Capabilities",
        description: "Advanced research workflows with multi-source data synthesis",
        icon: Target,
        benefits: ["Multi-source analysis", "Confidence scoring", "Adaptive queries"]
      },
      {
        title: "Natural Language Processing",
        description: "Communicate with AI agents using natural, conversational language",
        icon: MessageSquare,
        benefits: ["Intuitive interaction", "Context awareness", "Smart suggestions"]
      }
    ]
  },
  {
    category: "Market Analysis",
    icon: BarChart3,
    color: "from-green-500 to-blue-600",
    items: [
      {
        title: "Demographics Analysis",
        description: "Comprehensive demographic profiling for target market identification",
        icon: Users,
        benefits: ["Population insights", "Income analysis", "Lifestyle patterns"]
      },
      {
        title: "Competitor Intelligence",
        description: "Real-time competitor analysis and market positioning insights",
        icon: Building,
        benefits: ["Competitor mapping", "Pricing analysis", "Market gaps"]
      },
      {
        title: "Foot Traffic Analysis",
        description: "Advanced foot traffic patterns and customer flow analysis",
        icon: TrendingUp,
        benefits: ["Peak hour analysis", "Seasonal trends", "Customer behavior"]
      }
    ]
  },
  {
    category: "Location Intelligence",
    icon: MapPin,
    color: "from-purple-500 to-pink-600",
    items: [
      {
        title: "Interactive Map Canvas",
        description: "Dynamic map visualization with real-time data layers",
        icon: Globe,
        benefits: ["Live data sync", "Custom layers", "Interactive exploration"]
      },
      {
        title: "Site Recommendations",
        description: "AI-powered location scoring and recommendation engine",
        icon: Target,
        benefits: ["Location scoring", "Risk assessment", "Opportunity mapping"]
      },
      {
        title: "Zoning Compliance",
        description: "Automated zoning and regulatory compliance checking",
        icon: Shield,
        benefits: ["Compliance verification", "Permit guidance", "Risk mitigation"]
      }
    ]
  },
  {
    category: "Reporting & Analytics",
    icon: FileText,
    color: "from-orange-500 to-red-600",
    items: [
      {
        title: "Comprehensive Reports",
        description: "Professional market research reports with actionable insights",
        icon: FileText,
        benefits: ["PDF export", "Executive summaries", "Data visualization"]
      },
      {
        title: "Real-time Analytics",
        description: "Live analytics dashboard with performance metrics",
        icon: BarChart3,
        benefits: ["Real-time updates", "Custom metrics", "Trend analysis"]
      },
      {
        title: "Performance Tracking",
        description: "Track research progress and agent performance metrics",
        icon: Clock,
        benefits: ["Progress monitoring", "Performance insights", "Time tracking"]
      }
    ]
  }
];

const integrations = [
  { name: "Tavily Search API", description: "Real-time web search and market intelligence" },
  { name: "Geoapify Places", description: "Comprehensive location and POI data" },
  { name: "Mapbox", description: "Advanced mapping and visualization" },
  { name: "OpenAI GPT-4", description: "Advanced language understanding and generation" },
  { name: "LangChain", description: "AI agent orchestration and workflow management" },
  { name: "CopilotKit", description: "Conversational AI interface framework" }
];

function Features() {
  const router = useRouter();

  return (
    <PageTransition>
      <div className="min-h-screen bg-background">
        {/* Hero Section */}
        <section className="relative py-24 overflow-hidden">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/5 via-blue-500/5 to-purple-500/5" />
          
          <div className="relative z-10 max-w-7xl mx-auto px-4 text-center">
            <motion.div
              variants={staggerContainer}
              initial="hidden"
              animate="visible"
              className="space-y-8"
            >
              <motion.div variants={staggerItem}>
                <BiteBaseLogo size="lg" className="mx-auto mb-8" />
              </motion.div>

              <motion.div variants={staggerItem}>
                <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                  <Sparkles size={16} className="mr-2" />
                  Complete Feature Overview
                </Badge>
              </motion.div>

              <motion.div variants={staggerItem}>
                <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-primary via-blue-600 to-purple-600 bg-clip-text text-transparent">
                  Powerful Features for
                  <br />
                  Restaurant Intelligence
                </h1>
              </motion.div>

              <motion.div variants={staggerItem}>
                <RevealText className="text-xl text-muted-foreground max-w-3xl mx-auto leading-relaxed">
                  Discover the comprehensive suite of AI-powered tools and features that make BiteBase Intelligence the most advanced restaurant market research platform available.
                </RevealText>
              </motion.div>

              <motion.div variants={staggerItem} className="pt-8">
                <Button 
                  onClick={() => router.push('/auth/signup')}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-lg px-8 py-3"
                >
                  Start Free Trial
                  <ArrowRight size={20} className="ml-2" />
                </Button>
              </motion.div>
            </motion.div>
          </div>
        </section>

        {/* Features Grid */}
        <section className="py-24">
          <div className="max-w-7xl mx-auto px-4">
            {features.map((category, categoryIndex) => {
              const CategoryIcon = category.icon;
              
              return (
                <motion.div
                  key={category.category}
                  initial={{ opacity: 0, y: 50 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.6, delay: categoryIndex * 0.2 }}
                  viewport={{ once: true }}
                  className="mb-20"
                >
                  {/* Category Header */}
                  <div className="text-center mb-12">
                    <div className={`inline-flex items-center justify-center w-16 h-16 rounded-2xl bg-gradient-to-r ${category.color} mb-4`}>
                      <CategoryIcon size={32} className="text-white" />
                    </div>
                    <h2 className="text-3xl font-bold mb-4">{category.category}</h2>
                  </div>

                  {/* Features Grid */}
                  <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {category.items.map((feature, featureIndex) => {
                      const FeatureIcon = feature.icon;
                      
                      return (
                        <motion.div
                          key={feature.title}
                          initial={{ opacity: 0, y: 30 }}
                          whileInView={{ opacity: 1, y: 0 }}
                          transition={{ duration: 0.5, delay: featureIndex * 0.1 }}
                          viewport={{ once: true }}
                        >
                          <Card className="h-full hover:shadow-lg transition-all duration-300 group border-border/50 hover:border-primary/30">
                            <CardHeader>
                              <div className="flex items-center space-x-3 mb-3">
                                <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                                  <FeatureIcon size={20} className="text-primary" />
                                </div>
                                <CardTitle className="text-xl group-hover:text-primary transition-colors">
                                  {feature.title}
                                </CardTitle>
                              </div>
                              <CardDescription className="text-base leading-relaxed">
                                {feature.description}
                              </CardDescription>
                            </CardHeader>
                            <CardContent>
                              <div className="space-y-2">
                                {feature.benefits.map((benefit, index) => (
                                  <div key={index} className="flex items-center space-x-2">
                                    <CheckCircle size={16} className="text-green-500 flex-shrink-0" />
                                    <span className="text-sm text-muted-foreground">{benefit}</span>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        </motion.div>
                      );
                    })}
                  </div>
                </motion.div>
              );
            })}
          </div>
        </section>

        {/* Integrations Section */}
        <section className="py-24 bg-muted/30">
          <div className="max-w-7xl mx-auto px-4">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="text-center mb-16"
            >
              <Badge className="mb-6 bg-primary/10 text-primary border-primary/20">
                <Zap size={16} className="mr-2" />
                Powerful Integrations
              </Badge>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                Built on Industry-Leading APIs
              </h2>
              <p className="text-xl text-muted-foreground max-w-3xl mx-auto">
                BiteBase Intelligence integrates with the best-in-class APIs and services to provide you with the most accurate and comprehensive market research data.
              </p>
            </motion.div>

            <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
              {integrations.map((integration, index) => (
                <motion.div
                  key={integration.name}
                  initial={{ opacity: 0, scale: 0.9 }}
                  whileInView={{ opacity: 1, scale: 1 }}
                  transition={{ duration: 0.5, delay: index * 0.1 }}
                  viewport={{ once: true }}
                >
                  <Card className="text-center p-6 hover:shadow-lg transition-all duration-300 border-border/50 hover:border-primary/30">
                    <CardHeader>
                      <CardTitle className="text-lg">{integration.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-muted-foreground">{integration.description}</p>
                    </CardContent>
                  </Card>
                </motion.div>
              ))}
            </div>
          </div>
        </section>

        {/* CTA Section */}
        <section className="py-24">
          <div className="max-w-4xl mx-auto px-4 text-center">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              whileInView={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6 }}
              viewport={{ once: true }}
              className="space-y-8"
            >
              <h2 className="text-3xl md:text-4xl font-bold">
                Ready to Transform Your Restaurant Research?
              </h2>
              <p className="text-xl text-muted-foreground">
                Join thousands of restaurant entrepreneurs who trust BiteBase Intelligence for their market research needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button 
                  onClick={() => router.push('/auth/signup')}
                  className="bg-gradient-to-r from-primary to-blue-600 hover:from-blue-600 hover:to-primary text-lg px-8 py-3"
                >
                  Start Free Trial
                  <ArrowRight size={20} className="ml-2" />
                </Button>
                <Button 
                  onClick={() => router.push('/pricing')}
                  className="text-lg px-8 py-3"
                >
                  View Pricing
                </Button>
              </div>
            </motion.div>
          </div>
        </section>
      </div>
    </PageTransition>
  );
}

export default Features;
