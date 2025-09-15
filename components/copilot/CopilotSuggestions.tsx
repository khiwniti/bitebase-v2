import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { 
  Sparkles, 
  MapPin, 
  Users, 
  Target, 
  BarChart3, 
  Building, 
  Shield, 
  TrendingUp,
  Lightbulb,
  Search,
  FileText,
  Zap
} from 'lucide-react';
import { useCopilotReadable, useCopilotAction } from '@copilotkit/react-core';

interface Suggestion {
  id: string;
  text: string;
  category: string;
  icon: React.ComponentType<any>;
  priority: 'high' | 'medium' | 'low';
  context?: string;
  agentType?: string;
}

interface CopilotSuggestionsProps {
  onSuggestionClick: (suggestion: string) => void;
  currentLocation?: { lat: number; lng: number; address: string };
  businessContext?: any;
  activeAgents?: string[];
  className?: string;
}

// Dynamic suggestion generation based on context
const generateContextualSuggestions = (
  location?: { lat: number; lng: number; address: string },
  businessContext?: any,
  activeAgents: string[] = []
): Suggestion[] => {
  const suggestions: Suggestion[] = [];

  // Location-based suggestions
  if (location) {
    suggestions.push(
      {
        id: 'demo-location',
        text: `Analyze demographics for ${location.address}`,
        category: 'Demographics',
        icon: Users,
        priority: 'high',
        context: 'location',
        agentType: 'demographics'
      },
      {
        id: 'competitors-location',
        text: `Find competitors near ${location.address}`,
        category: 'Competition',
        icon: Target,
        priority: 'high',
        context: 'location',
        agentType: 'competitors'
      },
      {
        id: 'traffic-location',
        text: `Show foot traffic patterns for this area`,
        category: 'Traffic',
        icon: BarChart3,
        priority: 'medium',
        context: 'location',
        agentType: 'traffic'
      }
    );
  }

  // Business context suggestions
  if (businessContext?.businessType) {
    suggestions.push(
      {
        id: 'industry-trends',
        text: `Research ${businessContext.businessType} industry trends`,
        category: 'Deep Research',
        icon: TrendingUp,
        priority: 'high',
        context: 'business',
        agentType: 'deepresearch'
      },
      {
        id: 'target-market',
        text: `Analyze target market for ${businessContext.businessType}`,
        category: 'Demographics',
        icon: Users,
        priority: 'medium',
        context: 'business',
        agentType: 'demographics'
      }
    );
  }

  // Agent-specific suggestions
  if (!activeAgents.includes('zoning')) {
    suggestions.push({
      id: 'zoning-check',
      text: 'Check zoning regulations and permits',
      category: 'Compliance',
      icon: Shield,
      priority: 'medium',
      context: 'regulatory',
      agentType: 'zoning'
    });
  }

  if (!activeAgents.includes('sites')) {
    suggestions.push({
      id: 'site-recommendations',
      text: 'Generate optimal site recommendations',
      category: 'Location',
      icon: Building,
      priority: 'high',
      context: 'analysis',
      agentType: 'sites'
    });
  }

  // Deep research suggestions
  suggestions.push(
    {
      id: 'comprehensive-analysis',
      text: 'Conduct comprehensive market analysis',
      category: 'Deep Research',
      icon: Sparkles,
      priority: 'high',
      context: 'comprehensive',
      agentType: 'deepresearch'
    },
    {
      id: 'feasibility-study',
      text: 'Generate detailed feasibility study',
      category: 'Reports',
      icon: FileText,
      priority: 'medium',
      context: 'reporting',
      agentType: 'deepresearch'
    }
  );

  // General suggestions
  suggestions.push(
    {
      id: 'market-opportunities',
      text: 'Identify market opportunities and gaps',
      category: 'Strategy',
      icon: Lightbulb,
      priority: 'medium',
      context: 'strategy'
    },
    {
      id: 'risk-assessment',
      text: 'Perform risk assessment and mitigation',
      category: 'Risk',
      icon: Shield,
      priority: 'medium',
      context: 'risk'
    }
  );

  return suggestions;
};

export function CopilotSuggestions({
  onSuggestionClick,
  currentLocation,
  businessContext,
  activeAgents = [],
  className = ""
}: CopilotSuggestionsProps) {
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [isVisible, setIsVisible] = useState(true);

  // Generate suggestions based on context
  useEffect(() => {
    const contextualSuggestions = generateContextualSuggestions(
      currentLocation,
      businessContext,
      activeAgents
    );
    setSuggestions(contextualSuggestions);
  }, [currentLocation, businessContext, activeAgents]);

  // Make suggestions readable by CopilotKit
  useCopilotReadable({
    description: "Available intelligent suggestions for market research",
    value: {
      suggestions: suggestions.map(s => ({
        text: s.text,
        category: s.category,
        priority: s.priority,
        context: s.context
      })),
      activeCategory: selectedCategory,
      totalSuggestions: suggestions.length
    }
  });

  // CopilotKit action for suggestion interaction
  useCopilotAction({
    name: "selectSuggestion",
    description: "Select and execute a suggested query",
    parameters: [
      { name: "suggestionId", type: "string", description: "ID of the suggestion to execute" },
      { name: "customText", type: "string", description: "Custom text if modifying the suggestion" }
    ],
    handler: async ({ suggestionId, customText }) => {
      const suggestion = suggestions.find(s => s.id === suggestionId);
      if (suggestion) {
        onSuggestionClick(customText || suggestion.text);
        return `Executed suggestion: ${suggestion.text}`;
      }
      return "Suggestion not found";
    },
  });

  const categories = ['all', ...Array.from(new Set(suggestions.map(s => s.category)))];
  const filteredSuggestions = selectedCategory === 'all' 
    ? suggestions 
    : suggestions.filter(s => s.category === selectedCategory);

  const prioritySuggestions = filteredSuggestions
    .sort((a, b) => {
      const priorityOrder = { high: 3, medium: 2, low: 1 };
      return priorityOrder[b.priority] - priorityOrder[a.priority];
    })
    .slice(0, 8); // Limit to 8 suggestions

  if (!isVisible || suggestions.length === 0) {
    return null;
  }

  return (
    <Card className={`w-full ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="flex items-center gap-2 text-lg">
          <Sparkles className="w-5 h-5 text-primary" />
          Intelligent Suggestions
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setIsVisible(false)}
            className="ml-auto"
          >
            ×
          </Button>
        </CardTitle>
        
        {/* Category Filter */}
        <div className="flex flex-wrap gap-2">
          {categories.map(category => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "outline"}
              size="sm"
              onClick={() => setSelectedCategory(category)}
              className="text-xs capitalize"
            >
              {category}
            </Button>
          ))}
        </div>
      </CardHeader>

      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          <AnimatePresence>
            {prioritySuggestions.map((suggestion, index) => {
              const IconComponent = suggestion.icon;
              return (
                <motion.div
                  key={suggestion.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  transition={{ delay: index * 0.1 }}
                >
                  <Button
                    variant="ghost"
                    onClick={() => onSuggestionClick(suggestion.text)}
                    className="w-full h-auto p-3 justify-start text-left hover:bg-primary/5 border border-border/50 hover:border-primary/20"
                  >
                    <div className="flex items-start gap-3 w-full">
                      <div className={`p-2 rounded-lg ${
                        suggestion.priority === 'high' ? 'bg-primary/10 text-primary' :
                        suggestion.priority === 'medium' ? 'bg-blue-500/10 text-blue-500' :
                        'bg-muted text-muted-foreground'
                      }`}>
                        <IconComponent size={16} />
                      </div>
                      
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2 mb-1">
                          <Badge 
                            variant="secondary" 
                            className="text-xs"
                          >
                            {suggestion.category}
                          </Badge>
                          {suggestion.priority === 'high' && (
                            <Badge variant="destructive" className="text-xs">
                              <Zap size={10} className="mr-1" />
                              Priority
                            </Badge>
                          )}
                        </div>
                        
                        <p className="text-sm font-medium text-foreground">
                          {suggestion.text}
                        </p>
                        
                        {suggestion.agentType && (
                          <p className="text-xs text-muted-foreground mt-1">
                            Agent: {suggestion.agentType}
                          </p>
                        )}
                      </div>
                    </div>
                  </Button>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>

        {filteredSuggestions.length === 0 && (
          <div className="text-center py-8 text-muted-foreground">
            <Search className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No suggestions available for this category</p>
          </div>
        )}

        {filteredSuggestions.length > 8 && (
          <div className="mt-4 text-center">
            <Button variant="outline" size="sm">
              Show {filteredSuggestions.length - 8} more suggestions
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Quick suggestion buttons for common actions
export function QuickSuggestions({ 
  onSuggestionClick,
  className = ""
}: {
  onSuggestionClick: (suggestion: string) => void;
  className?: string;
}) {
  const quickSuggestions = [
    { text: "Show demographics", icon: Users },
    { text: "Find competitors", icon: Target },
    { text: "Analyze traffic", icon: BarChart3 },
    { text: "Deep research", icon: Sparkles }
  ];

  return (
    <div className={`flex flex-wrap gap-2 ${className}`}>
      {quickSuggestions.map((suggestion, index) => {
        const IconComponent = suggestion.icon;
        return (
          <Button
            key={index}
            variant="outline"
            size="sm"
            onClick={() => onSuggestionClick(suggestion.text)}
            className="text-xs"
          >
            <IconComponent size={12} className="mr-1" />
            {suggestion.text}
          </Button>
        );
      })}
    </div>
  );
}
