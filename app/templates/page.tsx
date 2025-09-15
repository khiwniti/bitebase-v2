'use client'

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { 
  Search, 
  Clock, 
  Users, 
  Target, 
  MapPin, 
  TrendingUp, 
  ArrowRight,
  Filter,
  Star
} from 'lucide-react';
import { marketResearchTemplates, getTemplateCategories, type MarketResearchTemplate } from '@/lib/marketResearchTemplates';

export default function Templates() {
  const router = useRouter();
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('All');
  
  const categories = ['All', ...getTemplateCategories()];
  
  // Filter templates based on search and category
  const filteredTemplates = marketResearchTemplates.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'All' || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleTemplateSelect = (template: MarketResearchTemplate) => {
    // Navigate to chat with template parameters
    const queryParams = new URLSearchParams({
      template: template.id,
      q: template.initialPrompt
    });
    router.push(`/chat?${queryParams.toString()}`);
  };

  const getComplexityColor = (complexity: string) => {
    switch (complexity) {
      case 'Basic': return 'bg-green-100 text-green-800';
      case 'Intermediate': return 'bg-yellow-100 text-yellow-800';
      case 'Advanced': return 'bg-red-100 text-red-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <div className="border-b border-border bg-background/95 backdrop-blur-lg">
        <div className="container mx-auto px-4 py-8">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-4xl font-bold mb-4">
              Market Research Templates
            </h1>
            <p className="text-lg text-muted-foreground mb-6">
              Choose from our specialized templates designed for different restaurant types. 
              Each template guides our AI agents to conduct targeted research for your specific business model.
            </p>
            
            {/* Search and Filter */}
            <div className="flex flex-col md:flex-row gap-4 max-w-2xl mx-auto">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground" size={20} />
                <Input
                  placeholder="Search templates..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-10"
                />
              </div>
              <div className="flex items-center space-x-2">
                <Filter size={20} className="text-muted-foreground" />
                <select
                  value={selectedCategory}
                  onChange={(e) => setSelectedCategory(e.target.value)}
                  className="px-3 py-2 border border-border rounded-md bg-background"
                >
                  {categories.map(category => (
                    <option key={category} value={category}>{category}</option>
                  ))}
                </select>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Templates Grid */}
      <div className="container mx-auto px-4 py-12">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template) => (
            <Card 
              key={template.id} 
              className="hover:shadow-lg transition-all duration-300 cursor-pointer border-2 hover:border-primary/30"
              onClick={() => handleTemplateSelect(template)}
            >
              <CardHeader>
                <div className="flex items-start justify-between mb-3">
                  <div className="text-4xl">{template.icon}</div>
                  <Badge className={getComplexityColor(template.complexity)}>
                    {template.complexity}
                  </Badge>
                </div>
                <CardTitle className="text-xl mb-2">{template.name}</CardTitle>
                <CardDescription className="text-sm leading-relaxed">
                  {template.description}
                </CardDescription>
              </CardHeader>
              
              <CardContent className="space-y-4">
                {/* Key Info */}
                <div className="flex items-center justify-between text-sm text-muted-foreground">
                  <div className="flex items-center space-x-1">
                    <Clock size={16} />
                    <span>{template.estimatedTime}</span>
                  </div>
                  <Badge variant="outline" className="text-xs">
                    {template.category}
                  </Badge>
                </div>

                {/* Target Market Preview */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Users size={16} className="mr-1" />
                    Target Market
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {template.researchParameters.targetMarket.slice(0, 3).map((market, index) => (
                      <Badge key={index} variant="secondary" className="text-xs">
                        {market}
                      </Badge>
                    ))}
                    {template.researchParameters.targetMarket.length > 3 && (
                      <Badge variant="secondary" className="text-xs">
                        +{template.researchParameters.targetMarket.length - 3} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Key Metrics Preview */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <TrendingUp size={16} className="mr-1" />
                    Key Focus Areas
                  </h4>
                  <div className="flex flex-wrap gap-1">
                    {template.researchParameters.keyMetrics.slice(0, 2).map((metric, index) => (
                      <Badge key={index} variant="outline" className="text-xs">
                        {metric}
                      </Badge>
                    ))}
                    {template.researchParameters.keyMetrics.length > 2 && (
                      <Badge variant="outline" className="text-xs">
                        +{template.researchParameters.keyMetrics.length - 2} more
                      </Badge>
                    )}
                  </div>
                </div>

                {/* Agents */}
                <div>
                  <h4 className="text-sm font-medium mb-2 flex items-center">
                    <Target size={16} className="mr-1" />
                    AI Agents
                  </h4>
                  <div className="text-xs text-muted-foreground">
                    {template.agentWorkflow.primaryAgents.join(', ')}
                  </div>
                </div>

                {/* CTA Button */}
                <Button 
                  className="w-full mt-4"
                  onClick={(e) => {
                    e.stopPropagation();
                    handleTemplateSelect(template);
                  }}
                >
                  Start Research
                  <ArrowRight size={16} className="ml-2" />
                </Button>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <div className="text-6xl mb-4">🔍</div>
            <h3 className="text-xl font-semibold mb-2">No templates found</h3>
            <p className="text-muted-foreground mb-4">
              Try adjusting your search terms or category filter
            </p>
            <Button 
              variant="outline" 
              onClick={() => {
                setSearchQuery('');
                setSelectedCategory('All');
              }}
            >
              Clear Filters
            </Button>
          </div>
        )}
      </div>

      {/* Bottom CTA */}
      <div className="bg-muted/30 py-16">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-3xl font-bold mb-4">
            Need a Custom Research Approach?
          </h2>
          <p className="text-lg text-muted-foreground mb-6 max-w-2xl mx-auto">
            Our AI agents can adapt to any restaurant concept. Start with a custom research session 
            and describe your unique business model.
          </p>
          <Button 
            size="lg"
            onClick={() => router.push('/chat')}
            className="px-8 py-3"
          >
            Start Custom Research
            <ArrowRight size={20} className="ml-2" />
          </Button>
        </div>
      </div>
    </div>
  );
}
