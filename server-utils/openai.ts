import OpenAI from "openai";

// the newest OpenAI model is "gpt-5" which was released August 7, 2025. do not change this unless explicitly requested by the user
const openai = new OpenAI({ 
  apiKey: process.env.OPENAI_API_KEY || process.env.OPENAI_API_KEY_ENV_VAR || "default_key" 
});

export interface MarketAnalysisRequest {
  location: string;
  businessType: 'restaurant' | 'cafe' | 'food_truck';
  targetDemographic?: string;
  budgetRange?: string;
}

export interface MarketAnalysisResponse {
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
  analysis: MarketAnalysisResponse;
}

export async function analyzeMarketData(request: MarketAnalysisRequest): Promise<MarketAnalysisResponse> {
  try {
    const prompt = `Analyze the restaurant/cafe market for the following request:
    
Location: ${request.location}
Business Type: ${request.businessType}
Target Demographic: ${request.targetDemographic || 'General'}
Budget Range: ${request.budgetRange || 'Not specified'}

Provide a comprehensive market analysis including demographics, competition, foot traffic patterns, opportunities, and risks. Rate the market viability from 1-10 and provide confidence level 0-1.

Respond with JSON in this exact format:
{
  "demographics": {
    "ageGroups": {"18-25": 20, "26-35": 35, "36-45": 25, "46-55": 15, "55+": 5},
    "incomeLevel": "middle-to-high",
    "lifestyle": ["tech-savvy", "health-conscious", "busy professionals"],
    "foodPreferences": ["healthy options", "quick service", "premium coffee"]
  },
  "competition": {
    "count": 45,
    "avgRating": 4.2,
    "priceGaps": ["$15-25 range", "healthy fast-casual"],
    "marketSaturation": "medium"
  },
  "footTraffic": {
    "level": "high",
    "peakHours": ["7-9 AM", "12-2 PM", "5-7 PM"],
    "weekdayVsWeekend": {"weekday": 75, "weekend": 45}
  },
  "opportunities": ["Late-night dining gap", "Healthy options demand", "Coffee + coworking space"],
  "risks": ["High rent costs", "Parking limitations", "Seasonal tourism fluctuations"],
  "score": 8.2,
  "confidence": 0.85
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a professional restaurant market research analyst with expertise in location analysis, demographics, and competition assessment."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result as MarketAnalysisResponse;
  } catch (error) {
    console.error('Error analyzing market data:', error);
    throw new Error('Failed to analyze market data: ' + (error as Error).message);
  }
}

export async function generateLocationRecommendations(
  location: string, 
  businessType: string,
  count: number = 3
): Promise<LocationRecommendation[]> {
  try {
    const prompt = `Generate ${count} specific location recommendations for a ${businessType} in ${location}. 
    
For each location, provide:
- Specific address or area
- Overall score (1-10)
- Estimated monthly rent
- 3-4 pros and cons
- Detailed market analysis

Respond with JSON array format:
[
  {
    "address": "123 Mission Street, San Francisco, CA",
    "score": 8.5,
    "rent": 4200,
    "pros": ["High foot traffic", "Young demographic", "Growing food scene"],
    "cons": ["Higher competition", "Parking challenges"],
    "analysis": {
      "demographics": {...},
      "competition": {...},
      "footTraffic": {...},
      "opportunities": [...],
      "risks": [...],
      "score": 8.5,
      "confidence": 0.9
    }
  }
]`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a commercial real estate expert specializing in restaurant and food service locations."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.8,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return result.recommendations || result as LocationRecommendation[];
  } catch (error) {
    console.error('Error generating location recommendations:', error);
    throw new Error('Failed to generate recommendations: ' + (error as Error).message);
  }
}

export async function processConversationalQuery(
  query: string,
  context: {
    sessionHistory: Array<{ role: string; content: string }>;
    currentLocation?: string;
    mapState?: any;
  }
): Promise<{
  response: string;
  mapActions?: Array<{
    type: 'layer_toggle' | 'location_analysis' | 'marker_add' | 'view_change';
    data: any;
  }>;
  followUpQuestions?: string[];
}> {
  try {
    const systemPrompt = `You are an AI assistant specializing in restaurant and cafe market research. 
    You help users analyze locations, understand demographics, assess competition, and make data-driven decisions.
    
    When users ask questions, you can:
    1. Provide market insights and analysis
    2. Suggest map actions to visualize data
    3. Recommend specific locations
    4. Explain demographic trends
    5. Analyze competition
    
    If a query requires map visualization, include mapActions in your response.
    Always provide helpful, specific, and actionable insights.
    
    Current context:
    - Location: ${context.currentLocation || 'Not specified'}
    - Map state: ${JSON.stringify(context.mapState || {})}`;

    const messages = [
      { role: "system", content: systemPrompt },
      ...context.sessionHistory.slice(-10), // Last 10 messages for context
      { role: "user", content: query }
    ];

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: messages as any,
      response_format: { type: "json_object" },
      temperature: 0.7,
    });

    const result = JSON.parse(response.choices[0].message.content!);
    return {
      response: result.response || result.content,
      mapActions: result.mapActions || [],
      followUpQuestions: result.followUpQuestions || []
    };
  } catch (error) {
    console.error('Error processing conversational query:', error);
    throw new Error('Failed to process query: ' + (error as Error).message);
  }
}

export async function generateReportSummary(
  sessionData: {
    messages: Array<{ role: string; content: string }>;
    mapAnalysis: any[];
    location: string;
  }
): Promise<{
  title: string;
  summary: string;
  recommendations: string[];
  marketScore: number;
  insights: Record<string, any>;
}> {
  try {
    const prompt = `Generate a comprehensive market research report summary based on the following session data:

Location: ${sessionData.location}
Chat Messages: ${JSON.stringify(sessionData.messages.slice(-20))}
Map Analysis: ${JSON.stringify(sessionData.mapAnalysis)}

Create a professional report summary with:
- Engaging title
- Executive summary
- Top 3-5 actionable recommendations
- Overall market score (1-10)
- Key insights organized by category

Respond with JSON format:
{
  "title": "Market Research Report Title",
  "summary": "Executive summary paragraph...",
  "recommendations": ["Recommendation 1", "Recommendation 2", ...],
  "marketScore": 8.5,
  "insights": {
    "demographics": "Key demographic insights...",
    "competition": "Competition analysis...",
    "opportunities": "Market opportunities...",
    "risks": "Potential risks..."
  }
}`;

    const response = await openai.chat.completions.create({
      model: "gpt-5",
      messages: [
        {
          role: "system",
          content: "You are a senior market research consultant creating executive reports for restaurant industry clients."
        },
        {
          role: "user",
          content: prompt
        }
      ],
      response_format: { type: "json_object" },
      temperature: 0.6,
    });

    return JSON.parse(response.choices[0].message.content!);
  } catch (error) {
    console.error('Error generating report summary:', error);
    throw new Error('Failed to generate report: ' + (error as Error).message);
  }
}
