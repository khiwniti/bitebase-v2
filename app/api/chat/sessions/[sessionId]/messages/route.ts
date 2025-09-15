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
    
    // Verify session exists and user owns it
    const session = await storage.getChatSession(sessionId);
    if (!session) {
      return NextResponse.json({ error: 'Session not found' }, { status: 404 });
    }

    if (session.userId !== user.claims.sub) {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const messages = await storage.getChatMessages(sessionId);
    
    // Ensure all data is JSON serializable
    const serializedMessages = messages.map(message => ({
      id: message.id,
      sessionId: message.sessionId,
      role: message.role,
      content: message.content,
      metadata: message.metadata,
      createdAt: message.createdAt,
    }));

    return NextResponse.json(serializedMessages);
  } catch (error) {
    console.error('Error fetching chat messages:', error);
    return NextResponse.json(
      { error: 'Failed to fetch chat messages' },
      { status: 500 }
    );
  }
}
