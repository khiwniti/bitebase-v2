export interface MapLayer {
  id: string;
  name: string;
  type: 'heatmap' | 'markers' | 'overlay';
  visible: boolean;
  data?: any;
}

export interface MapState {
  center: [number, number];
  zoom: number;
  layers: MapLayer[];
  activeAnalysis?: string;
}

export interface ChatMessage {
  id: string;
  sessionId: string;
  role: 'user' | 'assistant' | 'system';
  content: string;
  metadata?: {
    mapActions?: MapAction[];
    followUpQuestions?: string[];
    agentType?: string;
  };
  createdAt: string;
}

export interface MapAction {
  type: 'layer_toggle' | 'location_analysis' | 'marker_add' | 'view_change';
  data: any;
}

export interface ChatSession {
  id: string;
  userId: string;
  title: string;
  location?: string;
  mapState?: MapState;
  status: 'active' | 'completed' | 'archived';
  createdAt: string;
  updatedAt: string;
}

export interface MarketAnalysis {
  demographics: {
    ageGroups: Record<string, number>;
    incomeLevel: string;
    lifestyle: string[];
    foodPreferences: string[];
  };
  competition: {
    count: number;
    avgRating: number;
    priceGaps: string[];
    marketSaturation: 'low' | 'medium' | 'high';
  };
  footTraffic: {
    level: 'low' | 'medium' | 'high';
    peakHours: string[];
    weekdayVsWeekend: { weekday: number; weekend: number };
  };
  opportunities: string[];
  risks: string[];
  score: number;
  confidence: number;
}

export interface LocationRecommendation {
  address: string;
  score: number;
  rent: number;
  pros: string[];
  cons: string[];
  analysis: MarketAnalysis;
}

export interface Report {
  id: string;
  sessionId: string;
  title: string;
  summary?: string;
  recommendations?: string[];
  mapSnapshot?: string;
  marketScore?: number;
  insights?: Record<string, any>;
  exportedAt?: string;
  createdAt: string;
}
