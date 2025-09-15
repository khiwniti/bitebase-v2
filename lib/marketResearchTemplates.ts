export interface MarketResearchTemplate {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  estimatedTime: string;
  complexity: 'Basic' | 'Intermediate' | 'Advanced';
  
  // Research parameters that guide AI agents
  researchParameters: {
    businessType: string;
    targetMarket: string[];
    keyMetrics: string[];
    competitorAnalysis: string[];
    locationFactors: string[];
    financialConsiderations: string[];
    regulatoryRequirements: string[];
  };
  
  // Initial prompt that will be sent to AI agents
  initialPrompt: string;
  
  // Specific questions the AI should investigate
  researchQuestions: string[];
  
  // Expected deliverables
  deliverables: string[];
  
  // Agent workflow configuration
  agentWorkflow: {
    primaryAgents: string[];
    analysisDepth: 'surface' | 'detailed' | 'comprehensive';
    reportSections: string[];
  };
}

export const marketResearchTemplates: MarketResearchTemplate[] = [
  {
    id: 'qsr-setup',
    name: 'Quick Service Restaurant (QSR) Setup',
    description: 'Comprehensive market research for fast-food and quick-service restaurant establishments',
    category: 'Fast Food',
    icon: '🍔',
    estimatedTime: '15-20 minutes',
    complexity: 'Intermediate',
    
    researchParameters: {
      businessType: 'Quick Service Restaurant',
      targetMarket: ['Busy professionals', 'Students', 'Families', 'Delivery customers'],
      keyMetrics: ['Average transaction time', 'Peak hour capacity', 'Delivery radius', 'Price sensitivity'],
      competitorAnalysis: ['McDonald\'s', 'Subway', 'Chipotle', 'Local fast-food chains', 'Food trucks'],
      locationFactors: ['High foot traffic', 'Drive-thru accessibility', 'Parking availability', 'Delivery logistics'],
      financialConsiderations: ['Low startup costs', 'High volume sales', 'Franchise opportunities', 'Equipment costs'],
      regulatoryRequirements: ['Food safety permits', 'Drive-thru regulations', 'Signage permits', 'Health department compliance']
    },
    
    initialPrompt: `I'm planning to open a Quick Service Restaurant (QSR) and need comprehensive market research. Please analyze the fast-food market landscape, identify optimal locations with high foot traffic and drive-thru potential, evaluate major competitors like McDonald's and Subway, assess target demographics including busy professionals and students, and provide insights on startup costs, equipment requirements, and regulatory compliance for quick-service operations.`,
    
    researchQuestions: [
      'What are the peak hours and customer flow patterns for QSR locations in this area?',
      'How do major QSR competitors perform in terms of pricing, menu offerings, and customer satisfaction?',
      'What are the optimal location characteristics for drive-thru and walk-in traffic?',
      'What are the typical startup costs and equipment requirements for QSR operations?',
      'What food safety and operational permits are required for QSR establishments?',
      'What delivery and takeout trends are affecting the QSR market?',
      'How price-sensitive is the target demographic in this market?'
    ],
    
    deliverables: [
      'QSR Market Analysis Report',
      'Competitor Benchmarking Study',
      'Location Scoring and Recommendations',
      'Financial Projections and Startup Costs',
      'Regulatory Compliance Checklist',
      'Target Customer Profile Analysis',
      'Operational Efficiency Recommendations'
    ],
    
    agentWorkflow: {
      primaryAgents: ['Demographics Agent', 'Competitor Agent', 'Traffic Agent', 'Sites Agent', 'Zoning Agent'],
      analysisDepth: 'detailed',
      reportSections: ['Executive Summary', 'Market Overview', 'Competitor Analysis', 'Location Assessment', 'Financial Projections', 'Regulatory Requirements', 'Recommendations']
    }
  },

  {
    id: 'fine-dining-establishment',
    name: 'Fine Dining Restaurant Establishment',
    description: 'Sophisticated market analysis for upscale dining establishments and luxury restaurant concepts',
    category: 'Fine Dining',
    icon: '🍷',
    estimatedTime: '25-30 minutes',
    complexity: 'Advanced',
    
    researchParameters: {
      businessType: 'Fine Dining Restaurant',
      targetMarket: ['High-income professionals', 'Business executives', 'Special occasion diners', 'Food enthusiasts'],
      keyMetrics: ['Average check size', 'Table turnover rate', 'Wine program profitability', 'Customer lifetime value'],
      competitorAnalysis: ['Michelin-starred restaurants', 'High-end steakhouses', 'Celebrity chef establishments', 'Hotel restaurants'],
      locationFactors: ['Affluent neighborhoods', 'Business districts', 'Cultural areas', 'Valet parking', 'Ambiance potential'],
      financialConsiderations: ['High initial investment', 'Premium ingredient costs', 'Skilled staff wages', 'Extensive wine inventory'],
      regulatoryRequirements: ['Liquor license', 'Live entertainment permits', 'Valet parking permits', 'Fire safety compliance']
    },
    
    initialPrompt: `I'm planning to establish a fine dining restaurant and require sophisticated market research. Please analyze the upscale dining market, identify affluent neighborhoods and business districts suitable for high-end establishments, evaluate luxury competitors including Michelin-starred venues, assess high-income demographics and special occasion dining patterns, and provide insights on premium pricing strategies, wine program development, and the regulatory requirements for upscale restaurant operations.`,
    
    researchQuestions: [
      'What is the spending capacity and dining frequency of affluent customers in this market?',
      'How do successful fine dining establishments differentiate themselves and maintain premium pricing?',
      'What location characteristics contribute to the success of upscale restaurants?',
      'What are the typical investment requirements for fine dining restaurant buildouts?',
      'How important is wine program sophistication to fine dining success?',
      'What seasonal patterns affect fine dining revenue and operations?',
      'What staff qualifications and compensation are expected in fine dining?'
    ],
    
    deliverables: [
      'Fine Dining Market Landscape Report',
      'Luxury Competitor Analysis',
      'Affluent Demographics Study',
      'Premium Location Assessment',
      'Investment and ROI Projections',
      'Wine Program Strategy',
      'Staffing and Operations Plan'
    ],
    
    agentWorkflow: {
      primaryAgents: ['Demographics Agent', 'Competitor Agent', 'Sites Agent', 'Zoning Agent'],
      analysisDepth: 'comprehensive',
      reportSections: ['Market Positioning', 'Competitive Landscape', 'Target Demographics', 'Location Strategy', 'Financial Planning', 'Operational Excellence', 'Risk Assessment']
    }
  },

  {
    id: 'coffee-shop-launch',
    name: 'Coffee Shop/Cafe Launch',
    description: 'Targeted research for coffee shops, cafes, and specialty beverage establishments',
    category: 'Coffee & Cafe',
    icon: '☕',
    estimatedTime: '12-18 minutes',
    complexity: 'Basic',
    
    researchParameters: {
      businessType: 'Coffee Shop/Cafe',
      targetMarket: ['Remote workers', 'Students', 'Morning commuters', 'Social meetups', 'Coffee enthusiasts'],
      keyMetrics: ['Morning rush performance', 'WiFi usage patterns', 'Average dwell time', 'Loyalty program effectiveness'],
      competitorAnalysis: ['Starbucks', 'Local independent cafes', 'Dunkin\'', 'Specialty roasters', 'Coworking spaces'],
      locationFactors: ['Morning commute routes', 'University proximity', 'Business districts', 'Residential areas', 'WiFi infrastructure'],
      financialConsiderations: ['Espresso machine investment', 'Bean sourcing costs', 'Rent affordability', 'Seasonal fluctuations'],
      regulatoryRequirements: ['Food service license', 'Music licensing', 'WiFi compliance', 'Outdoor seating permits']
    },
    
    initialPrompt: `I'm launching a coffee shop/cafe and need comprehensive market research. Please analyze the local coffee market, identify locations with strong morning commuter traffic and remote worker populations, evaluate competitors from Starbucks to independent cafes, assess target demographics including students and professionals, and provide insights on equipment costs, bean sourcing, seasonal patterns, and the permits required for cafe operations with WiFi and potential outdoor seating.`,
    
    researchQuestions: [
      'What are the peak hours and customer behavior patterns for coffee shops in this area?',
      'How do successful independent cafes compete against major chains like Starbucks?',
      'What location features attract remote workers and students for extended stays?',
      'What are the startup costs for quality espresso equipment and initial inventory?',
      'How do seasonal patterns affect coffee shop revenue throughout the year?',
      'What WiFi and technology infrastructure do customers expect?',
      'What food offerings complement coffee sales most effectively?'
    ],
    
    deliverables: [
      'Coffee Market Analysis',
      'Competitor Positioning Study',
      'Remote Worker Demographics',
      'Location Traffic Patterns',
      'Equipment and Startup Costs',
      'Seasonal Revenue Projections',
      'Technology and Amenity Requirements'
    ],
    
    agentWorkflow: {
      primaryAgents: ['Demographics Agent', 'Competitor Agent', 'Traffic Agent', 'Sites Agent'],
      analysisDepth: 'detailed',
      reportSections: ['Market Overview', 'Competition Analysis', 'Customer Segments', 'Location Strategy', 'Financial Planning', 'Operational Considerations']
    }
  },

  {
    id: 'fast-casual-opening',
    name: 'Fast Casual Restaurant Opening',
    description: 'Market research for fast-casual dining concepts with quality ingredients and customizable options',
    category: 'Fast Casual',
    icon: '🥗',
    estimatedTime: '18-22 minutes',
    complexity: 'Intermediate',
    
    researchParameters: {
      businessType: 'Fast Casual Restaurant',
      targetMarket: ['Health-conscious consumers', 'Millennials', 'Lunch crowd', 'Families', 'Fitness enthusiasts'],
      keyMetrics: ['Customization preferences', 'Healthy option demand', 'Lunch rush capacity', 'Catering opportunities'],
      competitorAnalysis: ['Chipotle', 'Panera', 'Sweetgreen', 'Local bowl concepts', 'Healthy fast food'],
      locationFactors: ['Office complexes', 'Shopping centers', 'Gym proximity', 'University areas', 'Suburban locations'],
      financialConsiderations: ['Fresh ingredient costs', 'Assembly line setup', 'Technology integration', 'Catering revenue'],
      regulatoryRequirements: ['Fresh food handling', 'Nutritional labeling', 'Catering permits', 'Online ordering compliance']
    },
    
    initialPrompt: `I'm opening a fast-casual restaurant and need detailed market research. Please analyze the fast-casual dining segment, identify locations near office complexes and health-conscious demographics, evaluate competitors like Chipotle and Sweetgreen, assess demand for customizable healthy options, and provide insights on fresh ingredient sourcing, assembly line operations, technology integration for ordering, and catering opportunities in the market.`,
    
    researchQuestions: [
      'What health and customization trends are driving fast-casual growth?',
      'How do successful fast-casual brands balance speed with food quality?',
      'What locations provide the best access to health-conscious consumers?',
      'What are the operational requirements for fresh ingredient assembly lines?',
      'How important is technology integration for ordering and loyalty programs?',
      'What catering opportunities exist for fast-casual concepts?',
      'How do pricing strategies differ between fast-casual and traditional fast food?'
    ],
    
    deliverables: [
      'Fast-Casual Market Trends Report',
      'Health-Conscious Consumer Analysis',
      'Competitor Strategy Comparison',
      'Location and Demographics Study',
      'Operational Setup Requirements',
      'Technology Integration Plan',
      'Catering Market Assessment'
    ],
    
    agentWorkflow: {
      primaryAgents: ['Demographics Agent', 'Competitor Agent', 'Traffic Agent', 'Sites Agent'],
      analysisDepth: 'detailed',
      reportSections: ['Market Trends', 'Consumer Behavior', 'Competitive Positioning', 'Location Analysis', 'Operations Planning', 'Technology Strategy']
    }
  },

  {
    id: 'food-truck-venture',
    name: 'Food Truck/Mobile Restaurant Venture',
    description: 'Specialized research for mobile food service operations and food truck businesses',
    category: 'Mobile Food',
    icon: '🚚',
    estimatedTime: '15-20 minutes',
    complexity: 'Intermediate',
    
    researchParameters: {
      businessType: 'Food Truck/Mobile Restaurant',
      targetMarket: ['Event attendees', 'Office workers', 'Festival goers', 'Late-night diners', 'Catering clients'],
      keyMetrics: ['Event booking frequency', 'Location rotation success', 'Permit compliance', 'Fuel and maintenance costs'],
      competitorAnalysis: ['Established food trucks', 'Catering companies', 'Event vendors', 'Restaurant delivery', 'Pop-up concepts'],
      locationFactors: ['Event venues', 'Business districts', 'Festival circuits', 'Permitted parking zones', 'High-traffic areas'],
      financialConsiderations: ['Truck purchase/lease', 'Mobile equipment', 'Fuel costs', 'Insurance requirements', 'Permit fees'],
      regulatoryRequirements: ['Mobile vendor permits', 'Health department inspections', 'Fire department approval', 'Business licenses', 'Event permits']
    },
    
    initialPrompt: `I'm starting a food truck/mobile restaurant venture and need comprehensive market research. Please analyze the mobile food service market, identify high-traffic locations and event opportunities, evaluate food truck competitors and catering services, assess target demographics for mobile dining, and provide insights on truck acquisition costs, permit requirements, route optimization, and the regulatory compliance needed for mobile food operations across different jurisdictions.`,
    
    researchQuestions: [
      'What are the most profitable locations and events for food truck operations?',
      'How do successful food trucks build regular customer bases and routes?',
      'What are the permit and regulatory requirements for mobile food service?',
      'What are the total costs of truck acquisition, equipment, and ongoing operations?',
      'How do food trucks compete with restaurants and catering services?',
      'What seasonal patterns affect food truck revenue and operations?',
      'What technology solutions help with location tracking and customer communication?'
    ],
    
    deliverables: [
      'Mobile Food Service Market Analysis',
      'Event and Location Opportunity Map',
      'Food Truck Competitor Study',
      'Regulatory Compliance Guide',
      'Truck and Equipment Cost Analysis',
      'Route Optimization Strategy',
      'Technology and Marketing Plan'
    ],
    
    agentWorkflow: {
      primaryAgents: ['Demographics Agent', 'Competitor Agent', 'Traffic Agent', 'Zoning Agent'],
      analysisDepth: 'detailed',
      reportSections: ['Mobile Market Overview', 'Location Strategy', 'Regulatory Framework', 'Financial Planning', 'Operational Logistics', 'Marketing Approach']
    }
  }
];

// Helper function to get template by ID
export function getTemplateById(id: string): MarketResearchTemplate | undefined {
  return marketResearchTemplates.find(template => template.id === id);
}

// Helper function to get templates by category
export function getTemplatesByCategory(category: string): MarketResearchTemplate[] {
  return marketResearchTemplates.filter(template => template.category === category);
}

// Helper function to get all categories
export function getTemplateCategories(): string[] {
  return Array.from(new Set(marketResearchTemplates.map(template => template.category)));
}
