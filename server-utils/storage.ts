import {
  users,
  chatSessions,
  chatMessages,
  reports,
  mapAnalysis,
  type User,
  type UpsertUser,
  type ChatSession,
  type InsertChatSession,
  type ChatMessage,
  type InsertChatMessage,
  type Report,
  type InsertReport,
  type MapAnalysis,
  type InsertMapAnalysis,
} from "@shared/schema";
import { db } from "./db";
import { eq, desc, and } from "drizzle-orm";

export interface IStorage {
  // User operations (mandatory for Replit Auth)
  getUser(id: string): Promise<User | undefined>;
  upsertUser(user: UpsertUser): Promise<User>;
  
  // Chat session operations
  createChatSession(session: InsertChatSession): Promise<ChatSession>;
  getChatSession(id: string): Promise<ChatSession | undefined>;
  getUserChatSessions(userId: string): Promise<ChatSession[]>;
  updateChatSession(id: string, updates: Partial<InsertChatSession>): Promise<ChatSession>;
  
  // Chat message operations
  addMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getSessionMessages(sessionId: string): Promise<ChatMessage[]>;
  
  // Alias methods for backward compatibility
  createChatMessage(message: InsertChatMessage): Promise<ChatMessage>;
  getChatMessages(sessionId: string): Promise<ChatMessage[]>;
  
  // Report operations
  createReport(report: InsertReport): Promise<Report>;
  getReport(id: string): Promise<Report | undefined>;
  getSessionReports(sessionId: string): Promise<Report[]>;
  
  // Map analysis operations
  addMapAnalysis(analysis: InsertMapAnalysis): Promise<MapAnalysis>;
  getSessionMapAnalysis(sessionId: string): Promise<MapAnalysis[]>;
  getMapAnalysisByLocation(sessionId: string, location: string): Promise<MapAnalysis[]>;
}

export class DatabaseStorage implements IStorage {
  // User operations
  async getUser(id: string): Promise<User | undefined> {
    const [user] = await db.select().from(users).where(eq(users.id, id));
    return user;
  }

  async upsertUser(userData: UpsertUser): Promise<User> {
    const [user] = await db
      .insert(users)
      .values(userData)
      .onConflictDoUpdate({
        target: users.id,
        set: {
          ...userData,
          updatedAt: Math.floor(Date.now() / 1000),
        },
      })
      .returning();
    return user;
  }

  // Chat session operations
  async createChatSession(session: InsertChatSession): Promise<ChatSession> {
    const [newSession] = await db
      .insert(chatSessions)
      .values(session)
      .returning();
    return newSession;
  }

  async getChatSession(id: string): Promise<ChatSession | undefined> {
    const [session] = await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.id, id));
    return session;
  }

  async getUserChatSessions(userId: string): Promise<ChatSession[]> {
    return await db
      .select()
      .from(chatSessions)
      .where(eq(chatSessions.userId, userId))
      .orderBy(desc(chatSessions.updatedAt));
  }

  async updateChatSession(id: string, updates: Partial<InsertChatSession>): Promise<ChatSession> {
    const [session] = await db
      .update(chatSessions)
      .set({ ...updates, updatedAt: Math.floor(Date.now() / 1000) })
      .where(eq(chatSessions.id, id))
      .returning();
    return session;
  }

  // Chat message operations
  async addMessage(message: InsertChatMessage): Promise<ChatMessage> {
    const [newMessage] = await db
      .insert(chatMessages)
      .values(message)
      .returning();
    return newMessage;
  }

  async getSessionMessages(sessionId: string): Promise<ChatMessage[]> {
    return await db
      .select()
      .from(chatMessages)
      .where(eq(chatMessages.sessionId, sessionId))
      .orderBy(chatMessages.createdAt);
  }

  // Report operations
  async createReport(report: InsertReport): Promise<Report> {
    const [newReport] = await db
      .insert(reports)
      .values(report)
      .returning();
    return newReport;
  }

  async getReport(id: string): Promise<Report | undefined> {
    const [report] = await db
      .select()
      .from(reports)
      .where(eq(reports.id, id));
    return report;
  }

  async getSessionReports(sessionId: string): Promise<Report[]> {
    return await db
      .select()
      .from(reports)
      .where(eq(reports.sessionId, sessionId))
      .orderBy(desc(reports.createdAt));
  }

  // Map analysis operations
  async addMapAnalysis(analysis: InsertMapAnalysis): Promise<MapAnalysis> {
    const [newAnalysis] = await db
      .insert(mapAnalysis)
      .values(analysis)
      .returning();
    return newAnalysis;
  }

  async getSessionMapAnalysis(sessionId: string): Promise<MapAnalysis[]> {
    return await db
      .select()
      .from(mapAnalysis)
      .where(eq(mapAnalysis.sessionId, sessionId))
      .orderBy(desc(mapAnalysis.createdAt));
  }

  async getMapAnalysisByLocation(sessionId: string, location: string): Promise<MapAnalysis[]> {
    return await db
      .select()
      .from(mapAnalysis)
      .where(and(
        eq(mapAnalysis.sessionId, sessionId),
        eq(mapAnalysis.location, location)
      ))
      .orderBy(desc(mapAnalysis.createdAt));
  }

  // Alias methods for backward compatibility
  async createChatMessage(message: InsertChatMessage): Promise<ChatMessage> {
    return this.addMessage(message);
  }

  async getChatMessages(sessionId: string): Promise<ChatMessage[]> {
    return this.getSessionMessages(sessionId);
  }
}

export const storage = new DatabaseStorage();
