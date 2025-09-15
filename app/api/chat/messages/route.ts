import { NextRequest, NextResponse } from 'next/server';
import { storage } from '@/server-utils/storage';
import { authenticateRequest } from '@/server-utils/nextAuth';

export async function POST(request: NextRequest) {
  try {
    const user = await authenticateRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { sessionId, role, content, metadata } = body;

    // Verify session exists and user owns it
    const session = await storage.getChatSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.userId !== user.claims.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const message = await storage.createChatMessage({
      sessionId,
      role: role || 'user',
      content,
      metadata: metadata || {}
    });

    // Ensure all data is JSON serializable
    const serializedMessage = {
      id: message.id,
      sessionId: message.sessionId,
      role: message.role,
      content: message.content,
      metadata: message.metadata,
      createdAt: message.createdAt,
    };

    return NextResponse.json(serializedMessage);
  } catch (error) {
    console.error('Error creating chat message:', error);
    return NextResponse.json(
      { error: 'Failed to create chat message' },
      { status: 500 }
    );
  }
}
