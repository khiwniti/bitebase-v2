import { NextRequest, NextResponse } from 'next/server'
import { storage } from '@/server-utils/storage'
import { authenticateRequest } from '@/server-utils/nextAuth'
import { insertChatSessionSchema } from '@shared/schema'

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const userId = user.claims.sub;
    
    const sessionData = insertChatSessionSchema.parse({
      ...body,
      userId
    });
    
    const session = await storage.createChatSession(sessionData);
    
    // Ensure all data is JSON serializable
    const serializedSession = {
      id: session.id,
      userId: session.userId,
      title: session.title,
      location: session.location,
      mapState: session.mapState,
      status: session.status,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    };
    
    return NextResponse.json(serializedSession);
  } catch (error) {
    console.error("Error creating chat session:", error);
    return NextResponse.json(
      { message: "Failed to create chat session" },
      { status: 500 }
    );
  }
}

export async function GET(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.claims.sub;
    const sessions = await storage.getUserChatSessions(userId);
    
    // Ensure all data is JSON serializable
    const serializedSessions = sessions.map(session => ({
      id: session.id,
      userId: session.userId,
      title: session.title,
      location: session.location,
      mapState: session.mapState,
      status: session.status,
      createdAt: session.createdAt,
      updatedAt: session.updatedAt,
    }));
    
    return NextResponse.json(serializedSessions);
  } catch (error) {
    console.error("Error fetching chat sessions:", error);
    return NextResponse.json(
      { message: "Failed to fetch chat sessions" },
      { status: 500 }
    );
  }
}