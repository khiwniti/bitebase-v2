import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/server-utils/storage';
import { authenticateRequest } from '@/server-utils/nextAuth';

export async function GET(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = params;
    const session = await storage.getChatSession(sessionId);
    
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if user owns this session
    if (session.userId !== user.claims.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

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
    console.error('Error fetching chat session:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat session' },
      { status: 500 }
    );
  }
}

export async function PATCH(
  request: NextRequest,
  { params }: { params: { sessionId: string } }
) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { sessionId } = params;
    const body = await request.json();
    
    const session = await storage.getChatSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    // Check if user owns this session
    if (session.userId !== user.claims.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const updatedSession = await storage.updateChatSession(sessionId, body);

    // Ensure all data is JSON serializable
    const serializedSession = {
      id: updatedSession.id,
      userId: updatedSession.userId,
      title: updatedSession.title,
      location: updatedSession.location,
      mapState: updatedSession.mapState,
      status: updatedSession.status,
      createdAt: updatedSession.createdAt,
      updatedAt: updatedSession.updatedAt,
    };

    return NextResponse.json(serializedSession);
  } catch (error) {
    console.error('Error updating chat session:', error);
    return NextResponse.json(
      { error: 'Failed to update chat session' },
      { status: 500 }
    );
  }
}
