/**
 * Enhanced Session Management System
 * Provides comprehensive session isolation and state management for multi-agent research
 */

import { v4 as uuidv4 } from 'uuid';
import { storage } from './storage';
import { MarketResearchState } from './agents/multiAgentOrchestrator';

export interface SessionContext {
  sessionId: string;
  userId: string;
  title: string;
  status: 'active' | 'paused' | 'completed' | 'archived';
  createdAt: Date;
  lastActivity: Date;
  
  // Research context
  businessContext?: {
    businessType: string;
    targetMarket: string;
    budget: number;
    timeline: string;
    requirements?: string[];
  };
  
  // Location context
  currentLocation?: {
    lat: number;
    lng: number;
    address: string;
    region?: string;
  };
  
  // Agent collaboration state
  agentState: {
    activeAgents: string[];
    completedAnalyses: string[];
    sharedFindings: Record<string, any>;
    analysisPhase: 'discovery' | 'analysis' | 'recommendations' | 'complete';
    insights: Array<{
      type: string;
      title: string;
      description: string;
      timestamp: string;
      agentSource: string;
    }>;
  };
  
  // Map state
  mapState: {
    center: { lat: number; lng: number };
    zoom: number;
    layers: Array<{
      id: string;
      type: string;
      visible: boolean;
      data?: any;
    }>;
    markers: Array<{
      id: string;
      lat: number;
      lng: number;
      type: string;
      data: any;
    }>;
  };
  
  // Session metadata
  metadata: {
    messageCount: number;
    analysisCount: number;
    reportGenerated: boolean;
    lastReportAt?: Date;
    tags: string[];
    priority: 'low' | 'medium' | 'high';
  };
}

class SessionManager {
  private activeSessions: Map<string, SessionContext> = new Map();
  private sessionTimeouts: Map<string, NodeJS.Timeout> = new Map();
  
  // Session timeout in milliseconds (30 minutes)
  private readonly SESSION_TIMEOUT = 30 * 60 * 1000;
  
  /**
   * Create a new research session with proper isolation
   */
  async createSession(userId: string, initialData: {
    title?: string;
    businessContext?: any;
    location?: any;
  }): Promise<SessionContext> {
    const sessionId = uuidv4();
    const now = new Date();
    
    const session: SessionContext = {
      sessionId,
      userId,
      title: initialData.title || `Research Session - ${now.toLocaleDateString()}`,
      status: 'active',
      createdAt: now,
      lastActivity: now,
      
      businessContext: initialData.businessContext,
      currentLocation: initialData.location,
      
      agentState: {
        activeAgents: [],
        completedAnalyses: [],
        sharedFindings: {},
        analysisPhase: 'discovery',
        insights: []
      },
      
      mapState: {
        center: initialData.location || { lat: 37.7749, lng: -122.4194 },
        zoom: 12,
        layers: [
          { id: 'demographics', type: 'heatmap', visible: false },
          { id: 'competitors', type: 'markers', visible: false },
          { id: 'traffic', type: 'heatmap', visible: false },
          { id: 'opportunities', type: 'markers', visible: false },
          { id: 'zoning', type: 'overlay', visible: false }
        ],
        markers: []
      },
      
      metadata: {
        messageCount: 0,
        analysisCount: 0,
        reportGenerated: false,
        tags: [],
        priority: 'medium'
      }
    };
    
    // Store in memory for quick access
    this.activeSessions.set(sessionId, session);
    
    // Persist to database
    await storage.createChatSession({
      userId,
      title: session.title,
      mapState: JSON.stringify(session.mapState),
      metadata: JSON.stringify(session)
    });
    
    // Set session timeout
    this.setSessionTimeout(sessionId);
    
    console.log(`✅ Created new session: ${sessionId} for user: ${userId}`);
    return session;
  }
  
  /**
   * Get session with automatic loading from database if not in memory
   */
  async getSession(sessionId: string): Promise<SessionContext | null> {
    // Check memory first
    let session = this.activeSessions.get(sessionId);
    
    if (!session) {
      // Load from database
      try {
        const dbSession = await storage.getChatSession(sessionId);
        if (dbSession && dbSession.metadata) {
          session = JSON.parse(dbSession.metadata) as SessionContext;
          this.activeSessions.set(sessionId, session);
          this.setSessionTimeout(sessionId);
        }
      } catch (error) {
        console.error(`Failed to load session ${sessionId}:`, error);
        return null;
      }
    }
    
    return session || null;
  }
  
  /**
   * Update session state with proper isolation
   */
  async updateSession(sessionId: string, updates: Partial<SessionContext>): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) {
      throw new Error(`Session ${sessionId} not found`);
    }
    
    // Merge updates with existing session
    const updatedSession = {
      ...session,
      ...updates,
      lastActivity: new Date(),
      agentState: {
        ...session.agentState,
        ...(updates.agentState || {})
      },
      mapState: {
        ...session.mapState,
        ...(updates.mapState || {})
      },
      metadata: {
        ...session.metadata,
        ...(updates.metadata || {})
      }
    };
    
    // Update memory
    this.activeSessions.set(sessionId, updatedSession);
    
    // Persist to database
    await storage.updateChatSession(sessionId, {
      title: updatedSession.title,
      mapState: JSON.stringify(updatedSession.mapState),
      metadata: JSON.stringify(updatedSession)
    });
    
    // Reset timeout
    this.setSessionTimeout(sessionId);
  }
  
  /**
   * Add agent insight to session
   */
  async addInsight(sessionId: string, insight: {
    type: string;
    title: string;
    description: string;
    agentSource: string;
  }): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;
    
    const newInsight = {
      ...insight,
      timestamp: new Date().toISOString()
    };
    
    await this.updateSession(sessionId, {
      agentState: {
        ...session.agentState,
        insights: [...session.agentState.insights, newInsight]
      },
      metadata: {
        ...session.metadata,
        analysisCount: session.metadata.analysisCount + 1
      }
    });
  }
  
  /**
   * Update agent collaboration state
   */
  async updateAgentState(sessionId: string, agentUpdates: Partial<SessionContext['agentState']>): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;
    
    await this.updateSession(sessionId, {
      agentState: {
        ...session.agentState,
        ...agentUpdates
      }
    });
  }
  
  /**
   * Archive session and clean up resources
   */
  async archiveSession(sessionId: string): Promise<void> {
    const session = await this.getSession(sessionId);
    if (!session) return;
    
    await this.updateSession(sessionId, {
      status: 'archived',
      lastActivity: new Date()
    });
    
    // Remove from active memory
    this.activeSessions.delete(sessionId);
    
    // Clear timeout
    const timeout = this.sessionTimeouts.get(sessionId);
    if (timeout) {
      clearTimeout(timeout);
      this.sessionTimeouts.delete(sessionId);
    }
    
    console.log(`📦 Archived session: ${sessionId}`);
  }
  
  /**
   * Get all sessions for a user
   */
  async getUserSessions(userId: string, limit = 20): Promise<SessionContext[]> {
    try {
      const sessions = await storage.getUserChatSessions(userId);
      return sessions
        .filter(s => s.metadata)
        .map(s => JSON.parse(s.metadata!) as SessionContext)
        .sort((a, b) => b.lastActivity.getTime() - a.lastActivity.getTime());
    } catch (error) {
      console.error(`Failed to get sessions for user ${userId}:`, error);
      return [];
    }
  }
  
  /**
   * Set session timeout for automatic cleanup
   */
  private setSessionTimeout(sessionId: string): void {
    // Clear existing timeout
    const existingTimeout = this.sessionTimeouts.get(sessionId);
    if (existingTimeout) {
      clearTimeout(existingTimeout);
    }
    
    // Set new timeout
    const timeout = setTimeout(async () => {
      console.log(`⏰ Session ${sessionId} timed out, archiving...`);
      await this.archiveSession(sessionId);
    }, this.SESSION_TIMEOUT);
    
    this.sessionTimeouts.set(sessionId, timeout);
  }
  
  /**
   * Get session statistics
   */
  getSessionStats(sessionId: string): {
    activeAgents: number;
    completedAnalyses: number;
    totalInsights: number;
    sessionDuration: number;
  } | null {
    const session = this.activeSessions.get(sessionId);
    if (!session) return null;
    
    return {
      activeAgents: session.agentState.activeAgents.length,
      completedAnalyses: session.agentState.completedAnalyses.length,
      totalInsights: session.agentState.insights.length,
      sessionDuration: Date.now() - session.createdAt.getTime()
    };
  }
  
  /**
   * Clean up all sessions (for shutdown)
   */
  cleanup(): void {
    this.sessionTimeouts.forEach(timeout => clearTimeout(timeout));
    this.sessionTimeouts.clear();
    this.activeSessions.clear();
    console.log('🧹 Session manager cleaned up');
  }
}

// Export singleton instance
export const sessionManager = new SessionManager();

// Graceful shutdown
process.on('SIGTERM', () => sessionManager.cleanup());
process.on('SIGINT', () => sessionManager.cleanup());
