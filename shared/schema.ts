import { sql } from 'drizzle-orm';
import {
  index,
  sqliteTable,
  text,
  integer,
  real,
} from "drizzle-orm/sqlite-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";

// Session storage table for SQLite
export const sessions = sqliteTable(
  "sessions",
  {
    sid: text("sid").primaryKey(),
    sess: text("sess").notNull(), // JSON stored as text in SQLite
    expire: integer("expire").notNull(), // Unix timestamp
  },
  (table) => [index("IDX_session_expire").on(table.expire)],
);

// User storage table
export const users = sqliteTable("users", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  email: text("email").unique(),
  firstName: text("first_name"),
  lastName: text("last_name"),
  profileImageUrl: text("profile_image_url"),
  businessType: text("business_type"),
  createdAt: integer("created_at").$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").$defaultFn(() => Date.now()),
});

// Chat sessions for market research
export const chatSessions = sqliteTable("chat_sessions", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  location: text("location"),
  mapState: text("map_state"), // JSON stored as text in SQLite
  metadata: text("metadata"), // Additional session metadata as JSON
  status: text("status").notNull().default("active"), // active, completed, archived
  createdAt: integer("created_at").$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").$defaultFn(() => Date.now()),
});

// Individual chat messages
export const chatMessages = sqliteTable("chat_messages", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id").notNull(),
  role: text("role").notNull(), // user, assistant, system
  content: text("content").notNull(),
  metadata: text("metadata"), // JSON stored as text for storing agent type, map actions, etc.
  createdAt: integer("created_at").$defaultFn(() => Date.now()),
});

// Market research reports
export const reports = sqliteTable("reports", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id").notNull(),
  userId: text("user_id").notNull(),
  title: text("title").notNull(),
  content: text("content"), // Full report content
  summary: text("summary"),
  recommendations: text("recommendations"), // JSON stored as text
  mapSnapshot: text("map_snapshot"), // base64 encoded image
  marketScore: real("market_score"),
  insights: text("insights"), // JSON stored as text
  metadata: text("metadata"), // Additional report metadata as JSON
  exportedAt: integer("exported_at"),
  createdAt: integer("created_at").$defaultFn(() => Date.now()),
  updatedAt: integer("updated_at").$defaultFn(() => Date.now()),
});

// Map analysis data
export const mapAnalysis = sqliteTable("map_analysis", {
  id: text("id").primaryKey().$defaultFn(() => crypto.randomUUID()),
  sessionId: text("session_id").notNull(),
  location: text("location").notNull(),
  latitude: real("latitude").notNull(),
  longitude: real("longitude").notNull(),
  analysisType: text("analysis_type").notNull(), // demographics, competitors, traffic, rent
  data: text("data").notNull(), // JSON stored as text
  confidence: real("confidence"),
  createdAt: integer("created_at").$defaultFn(() => Date.now()),
});

// Relations
import { relations } from "drizzle-orm";

export const usersRelations = relations(users, ({ many }) => ({
  chatSessions: many(chatSessions),
}));

export const chatSessionsRelations = relations(chatSessions, ({ one, many }) => ({
  user: one(users, {
    fields: [chatSessions.userId],
    references: [users.id],
  }),
  messages: many(chatMessages),
  reports: many(reports),
  mapAnalysis: many(mapAnalysis),
}));

export const chatMessagesRelations = relations(chatMessages, ({ one }) => ({
  session: one(chatSessions, {
    fields: [chatMessages.sessionId],
    references: [chatSessions.id],
  }),
}));

export const reportsRelations = relations(reports, ({ one }) => ({
  session: one(chatSessions, {
    fields: [reports.sessionId],
    references: [chatSessions.id],
  }),
  user: one(users, {
    fields: [reports.userId],
    references: [users.id],
  }),
}));

export const mapAnalysisRelations = relations(mapAnalysis, ({ one }) => ({
  session: one(chatSessions, {
    fields: [mapAnalysis.sessionId],
    references: [chatSessions.id],
  }),
}));

// Schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatSessionSchema = createInsertSchema(chatSessions).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertChatMessageSchema = createInsertSchema(chatMessages).omit({
  id: true,
  createdAt: true,
});

export const insertReportSchema = createInsertSchema(reports).omit({
  id: true,
  createdAt: true,
});

export const insertMapAnalysisSchema = createInsertSchema(mapAnalysis).omit({
  id: true,
  createdAt: true,
});

// Types
export type UpsertUser = typeof users.$inferInsert;
export type User = typeof users.$inferSelect;
export type InsertChatSession = z.infer<typeof insertChatSessionSchema>;
export type ChatSession = typeof chatSessions.$inferSelect;
export type InsertChatMessage = z.infer<typeof insertChatMessageSchema>;
export type ChatMessage = typeof chatMessages.$inferSelect;
export type InsertReport = z.infer<typeof insertReportSchema>;
export type Report = typeof reports.$inferSelect;
export type InsertMapAnalysis = z.infer<typeof insertMapAnalysisSchema>;
export type MapAnalysis = typeof mapAnalysis.$inferSelect;
