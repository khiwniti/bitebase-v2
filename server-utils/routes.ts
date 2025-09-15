import type { Express } from "express";
import { createServer, type Server } from "http";
import { BaseMessage, HumanMessage, AIMessage } from "@langchain/core/messages";
import { storage } from "./storage";
import { setupAuth, isAuthenticated } from "./auth";
import { wsManager } from "./websocket";
import {
  analyzeMarketData,
  generateLocationRecommendations,
  processConversationalQuery,
  generateReportSummary
} from "./openai";
import { setupCopilotRuntimeExpress as setupCopilotRuntime, transformAgentStateForFrontend, extractInsightsFromCollaboration } from "./copilotIntegration";
import { marketResearchGraph, MarketResearchState } from "./agents/multiAgentOrchestrator";
import { insertChatSessionSchema, insertChatMessageSchema, insertReportSchema } from "@shared/schema";
import { aiProviderRoutes } from "./routes/aiProviders";

export async function registerRoutes(app: Express): Promise<Server> {
  // Auth middleware
  await setupAuth(app);

  // Auth routes
  app.get('/api/auth/user', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const user = await storage.getUser(userId);
      res.json(user);
    } catch (error) {
      console.error("Error fetching user:", error);
      res.status(500).json({ message: "Failed to fetch user" });
    }
  });

  // Chat session routes
  app.post('/api/chat/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessionData = insertChatSessionSchema.parse({
        ...req.body,
        userId
      });
      
      const session = await storage.createChatSession(sessionData);
      res.json(session);
    } catch (error) {
      console.error("Error creating chat session:", error);
      res.status(500).json({ message: "Failed to create chat session" });
    }
  });

  app.get('/api/chat/sessions', isAuthenticated, async (req: any, res) => {
    try {
      const userId = req.user.claims.sub;
      const sessions = await storage.getUserChatSessions(userId);
      res.json(sessions);
    } catch (error) {
      console.error("Error fetching chat sessions:", error);
      res.status(500).json({ message: "Failed to fetch chat sessions" });
    }
  });

  app.get('/api/chat/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const session = await storage.getChatSession(req.params.id);
      if (!session) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      // Check if user owns this session
      if (session.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(session);
    } catch (error) {
      console.error("Error fetching chat session:", error);
      res.status(500).json({ message: "Failed to fetch chat session" });
    }
  });

  app.patch('/api/chat/sessions/:id', isAuthenticated, async (req: any, res) => {
    try {
      const session = await storage.getChatSession(req.params.id);
      if (!session || session.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const updates = req.body;
      const updatedSession = await storage.updateChatSession(req.params.id, updates);
      res.json(updatedSession);
    } catch (error) {
      console.error("Error updating chat session:", error);
      res.status(500).json({ message: "Failed to update chat session" });
    }
  });

  // Chat message routes
  app.post('/api/chat/messages', isAuthenticated, async (req: any, res) => {
    try {
      const messageData = insertChatMessageSchema.parse(req.body);
      
      // Verify session ownership
      const session = await storage.getChatSession(messageData.sessionId);
      if (!session || session.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const message = await storage.addMessage(messageData);
      
      // Process AI response if it's a user message
      if (messageData.role === 'user') {
        try {
          const sessionHistory = await storage.getSessionMessages(messageData.sessionId);
          const aiResponse = await processConversationalQuery(messageData.content, {
            sessionHistory: sessionHistory.map(m => ({ role: m.role, content: m.content })),
            currentLocation: session.location || undefined,
            mapState: session.mapState || undefined
          });
          
          // Save AI response
          const aiMessage = await storage.addMessage({
            sessionId: messageData.sessionId,
            role: 'assistant',
            content: aiResponse.response,
            metadata: JSON.stringify({ 
              mapActions: aiResponse.mapActions,
              followUpQuestions: aiResponse.followUpQuestions 
            })
          });
          
          // Send real-time updates via WebSocket
          wsManager.sendToSession(messageData.sessionId, {
            type: 'chat_update',
            sessionId: messageData.sessionId,
            message: {
              role: 'assistant',
              content: aiResponse.response,
              metadata: aiMessage.metadata
            }
          });
          
          // Send map actions if any
          if (aiResponse.mapActions && aiResponse.mapActions.length > 0) {
            aiResponse.mapActions.forEach(action => {
              wsManager.sendToSession(messageData.sessionId, {
                type: 'map_update',
                sessionId: messageData.sessionId,
                action: action.type,
                data: action.data
              });
            });
          }
          
        } catch (aiError) {
          console.error("Error processing AI response:", aiError);
          // Still return the user message even if AI fails
        }
      }
      
      res.json(message);
    } catch (error) {
      console.error("Error adding message:", error);
      res.status(500).json({ message: "Failed to add message" });
    }
  });

  app.get('/api/chat/sessions/:id/messages', isAuthenticated, async (req: any, res) => {
    try {
      const session = await storage.getChatSession(req.params.id);
      if (!session || session.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const messages = await storage.getSessionMessages(req.params.id);
      res.json(messages);
    } catch (error) {
      console.error("Error fetching messages:", error);
      res.status(500).json({ message: "Failed to fetch messages" });
    }
  });

  // Market analysis routes
  app.post('/api/analysis/market', isAuthenticated, async (req: any, res) => {
    try {
      const { location, businessType, targetDemographic, budgetRange } = req.body;
      
      const analysis = await analyzeMarketData({
        location,
        businessType,
        targetDemographic,
        budgetRange
      });
      
      res.json(analysis);
    } catch (error) {
      console.error("Error analyzing market:", error);
      res.status(500).json({ message: "Failed to analyze market" });
    }
  });

  app.post('/api/analysis/recommendations', isAuthenticated, async (req: any, res) => {
    try {
      const { location, businessType, count = 3 } = req.body;
      
      const recommendations = await generateLocationRecommendations(
        location,
        businessType,
        count
      );
      
      res.json(recommendations);
    } catch (error) {
      console.error("Error generating recommendations:", error);
      res.status(500).json({ message: "Failed to generate recommendations" });
    }
  });

  // Report routes
  app.post('/api/reports', isAuthenticated, async (req: any, res) => {
    try {
      const reportData = insertReportSchema.parse(req.body);
      
      // Verify session ownership
      const session = await storage.getChatSession(reportData.sessionId);
      if (!session || session.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      const report = await storage.createReport(reportData);
      res.json(report);
    } catch (error) {
      console.error("Error creating report:", error);
      res.status(500).json({ message: "Failed to create report" });
    }
  });

  app.post('/api/reports/generate/:sessionId', isAuthenticated, async (req: any, res) => {
    try {
      const sessionId = req.params.sessionId;
      const session = await storage.getChatSession(sessionId);
      
      if (!session || session.userId !== req.user.claims.sub) {
        return res.status(404).json({ message: "Session not found" });
      }
      
      const messages = await storage.getSessionMessages(sessionId);
      const mapAnalysis = await storage.getSessionMapAnalysis(sessionId);
      
      const reportSummary = await generateReportSummary({
        messages: messages.map(m => ({ role: m.role, content: m.content })),
        mapAnalysis,
        location: session.location || 'Unknown'
      });
      
      const report = await storage.createReport({
        sessionId,
        userId: 'anonymous',
        title: reportSummary.title,
        summary: reportSummary.summary,
        recommendations: JSON.stringify(reportSummary.recommendations),
        marketScore: reportSummary.marketScore,
        insights: JSON.stringify(reportSummary.insights),
        exportedAt: Date.now()
      });
      
      res.json(report);
    } catch (error) {
      console.error("Error generating report:", error);
      res.status(500).json({ message: "Failed to generate report" });
    }
  });

  app.get('/api/reports/:id', isAuthenticated, async (req: any, res) => {
    try {
      const report = await storage.getReport(req.params.id);
      if (!report) {
        return res.status(404).json({ message: "Report not found" });
      }
      
      // Verify ownership through session
      const session = await storage.getChatSession(report.sessionId);
      if (!session || session.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      res.json(report);
    } catch (error) {
      console.error("Error fetching report:", error);
      res.status(500).json({ message: "Failed to fetch report" });
    }
  });

  // Map analysis routes
  app.post('/api/map/analysis', isAuthenticated, async (req: any, res) => {
    try {
      const { sessionId, location, latitude, longitude, analysisType } = req.body;
      
      // Verify session ownership
      const session = await storage.getChatSession(sessionId);
      if (!session || session.userId !== req.user.claims.sub) {
        return res.status(403).json({ message: "Access denied" });
      }
      
      // Generate analysis based on type
      let analysisData = {};
      let confidence = 0.8;
      
      switch (analysisType) {
        case 'demographics':
          const marketAnalysis = await analyzeMarketData({
            location,
            businessType: 'restaurant'
          });
          analysisData = marketAnalysis.demographics;
          confidence = marketAnalysis.confidence;
          break;
        case 'competitors':
          analysisData = {
            count: Math.floor(Math.random() * 50) + 10,
            avgRating: 3.5 + Math.random() * 1.5,
            categories: ['fast-food', 'casual-dining', 'coffee']
          };
          break;
        case 'traffic':
          analysisData = {
            level: ['low', 'medium', 'high'][Math.floor(Math.random() * 3)],
            peakHours: ['7-9 AM', '12-2 PM', '5-7 PM'],
            weekdayScore: Math.floor(Math.random() * 40) + 60
          };
          break;
        case 'rent':
          analysisData = {
            averageRent: Math.floor(Math.random() * 5000) + 2000,
            trend: ['increasing', 'stable', 'decreasing'][Math.floor(Math.random() * 3)],
            affordabilityScore: Math.floor(Math.random() * 100)
          };
          break;
      }
      
      const analysis = await storage.addMapAnalysis({
        sessionId,
        location,
        latitude,
        longitude,
        analysisType,
        data: JSON.stringify(analysisData),
        confidence
      });
      
      res.json(analysis);
    } catch (error) {
      console.error("Error creating map analysis:", error);
      res.status(500).json({ message: "Failed to create map analysis" });
    }
  });

  // Enhanced chat endpoint with multi-agent support
  app.post('/api/chat/sessions/:sessionId/messages/agent', isAuthenticated, async (req, res) => {
    try {
      const { sessionId } = req.params;
      const { message, agentType, context } = req.body;

      // Get or create session
      let session = await storage.getChatSession(sessionId);
      if (!session) {
        session = await storage.createChatSession({
          userId: (req.user as any)?.claims?.sub || 'anonymous',
          title: `Market Research - ${new Date().toLocaleDateString()}`,
          mapState: context?.mapState || {}
        });
      }

      // Invoke the multi-agent system
      const config = {
        configurable: {
          thread_id: sessionId,
          user_id: (req.user as any)?.claims?.sub || 'anonymous'
        }
      };

      const initialState = {
        messages: [new HumanMessage(message)],
        sessionId,
        currentLocation: context?.location || null,
        analysisContext: context?.businessContext || null,
        agentCollaboration: {
          activeAgents: [],
          sharedFindings: {},
          analysisPhase: 'discovery' as const
        },
        mapState: context?.mapState || {},
        tools: []
      };

      // Stream the agent response
      const stream = await marketResearchGraph.stream(initialState, config);

      let finalState = null;
      for await (const chunk of stream) {
        finalState = chunk;
        // Send real-time updates via WebSocket
        wsManager.sendToSession(sessionId, {
          type: 'chat_update',
          sessionId,
          message: {
            role: 'assistant',
            content: finalState ? JSON.stringify(transformAgentStateForFrontend(finalState as any)) : 'Processing...',
            metadata: {}
          }
        });
      }

      if (finalState) {
        // Extract the final response
        const finalMessages = (finalState as any).coordinator?.messages || (finalState as any).messages || [];
        const lastMessage = finalMessages[finalMessages.length - 1];

        // Save the conversation to database
        await storage.addMessage({
          sessionId,
          role: 'user',
          content: message,
          metadata: JSON.stringify({ agentType, context })
        });

        await storage.addMessage({
          sessionId,
          role: 'assistant',
          content: lastMessage.content,
          metadata: JSON.stringify({
            agentCollaboration: (finalState as any).agentCollaboration,
            insights: extractInsightsFromCollaboration(finalState as any)
          })
        });

        // Update session with latest state
        await storage.updateChatSession(sessionId, {
          mapState: JSON.stringify((finalState as any).mapState) || null
        });

        res.json({
          message: lastMessage.content,
          agentState: finalState ? transformAgentStateForFrontend(finalState as any) : null,
          insights: finalState ? extractInsightsFromCollaboration(finalState as any) : []
        });
      } else {
        res.status(500).json({ message: "Failed to get agent response" });
      }
    } catch (error) {
      console.error("Error in agent chat:", error);
      res.status(500).json({ message: "Failed to process agent request" });
    }
  });

  // Agent-specific analysis endpoints
  app.post('/api/analysis/demographics', isAuthenticated, async (req, res) => {
    try {
      const { location, radius = 3 } = req.body;

      // This would integrate with the demographics agent
      const analysis = {
        location,
        population: Math.floor(Math.random() * 50000) + 10000,
        medianIncome: Math.floor(Math.random() * 40000) + 40000,
        ageDistribution: {
          "18-25": Math.floor(Math.random() * 20) + 10,
          "26-35": Math.floor(Math.random() * 25) + 15,
          "36-50": Math.floor(Math.random() * 30) + 20,
          "51-65": Math.floor(Math.random() * 20) + 15,
          "65+": Math.floor(Math.random() * 15) + 10
        },
        marketPotential: Math.floor(Math.random() * 40) + 60,
        timestamp: new Date().toISOString()
      };

      res.json(analysis);
    } catch (error) {
      console.error("Error in demographic analysis:", error);
      res.status(500).json({ message: "Failed to analyze demographics" });
    }
  });

  const httpServer = createServer(app);

  // Initialize WebSocket server
  wsManager.initialize(httpServer);

  // Setup AI Provider routes
  app.use('/api/ai', aiProviderRoutes);

  // Setup enhanced CopilotKit integration
  setupCopilotRuntime(app);

  return httpServer;
}
