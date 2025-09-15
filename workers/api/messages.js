import { Router } from 'itty-router';
import { createResponse, checkRateLimit } from '../src/utils';

const router = Router({ base: '/api/messages' });

// Generate UUID
function generateUUID() {
  return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
    var r = Math.random() * 16 | 0, v = c == 'x' ? r : (r & 0x3 | 0x8);
    return v.toString(16);
  });
}

// POST /api/messages - Create new message
router.post('/', async (request) => {
  try {
    const clientIP = request.headers.get('CF-Connecting-IP') || 'unknown';
    if (!await checkRateLimit(request.env, `messages:${clientIP}`, 120, 60)) {
      return createResponse(
        { error: 'Rate limit exceeded' },
        { status: 429 }
      );
    }

    const body = await request.json();
    const { sessionId, content, sender, metadata } = body;

    // Validate required fields
    if (!sessionId || !content || !sender) {
      return createResponse(
        { error: 'Missing required fields: sessionId, content, sender' },
        { status: 400 }
      );
    }

    // Validate sender
    if (!['user', 'assistant'].includes(sender)) {
      return createResponse(
        { error: 'Invalid sender. Must be "user" or "assistant"' },
        { status: 400 }
      );
    }

    const messageId = generateUUID();
    const message = {
      id: messageId,
      sessionId,
      content,
      sender,
      metadata: metadata ? JSON.stringify(metadata) : null,
      createdAt: new Date().toISOString(),
    };

    // Store message in KV
    if (request.env.CACHE) {
      const messagesKey = `messages:${sessionId}`;
      
      // Get existing messages
      const existingData = await request.env.CACHE.get(messagesKey);
      const messages = existingData ? JSON.parse(existingData) : [];
      
      // Add new message
      messages.push(message);
      
      // Store updated messages (limit to last 100 messages)
      const limitedMessages = messages.slice(-100);
      await request.env.CACHE.put(
        messagesKey,
        JSON.stringify(limitedMessages),
        { expirationTtl: 24 * 60 * 60 } // 24 hours
      );
    }

    return createResponse(message);

  } catch (error) {
    console.error('Message creation error:', error);
    return createResponse(
      { error: 'Failed to create message', message: error.message },
      { status: 500 }
    );
  }
});

// GET /api/messages?sessionId=:sessionId - Get messages for session
router.get('/', async (request) => {
  try {
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!sessionId) {
      return createResponse(
        { error: 'sessionId parameter required' },
        { status: 400 }
      );
    }

    let messages = [];
    
    // Get messages from KV
    if (request.env.CACHE) {
      const messagesKey = `messages:${sessionId}`;
      const cached = await request.env.CACHE.get(messagesKey);
      if (cached) {
        messages = JSON.parse(cached);
      }
    }

    return createResponse({
      messages,
      total: messages.length,
      sessionId
    });

  } catch (error) {
    console.error('Message retrieval error:', error);
    return createResponse(
      { error: 'Failed to retrieve messages', message: error.message },
      { status: 500 }
    );
  }
});

// DELETE /api/messages/:messageId - Delete message
router.delete('/:messageId', async (request) => {
  try {
    const { messageId } = request.params;
    const url = new URL(request.url);
    const sessionId = url.searchParams.get('sessionId');

    if (!messageId || !sessionId) {
      return createResponse(
        { error: 'messageId and sessionId required' },
        { status: 400 }
      );
    }

    // Get existing messages
    if (request.env.CACHE) {
      const messagesKey = `messages:${sessionId}`;
      const cached = await request.env.CACHE.get(messagesKey);
      
      if (cached) {
        const messages = JSON.parse(cached);
        const updatedMessages = messages.filter(msg => msg.id !== messageId);
        
        await request.env.CACHE.put(
          messagesKey,
          JSON.stringify(updatedMessages),
          { expirationTtl: 24 * 60 * 60 }
        );
      }
    }

    return createResponse({
      success: true,
      messageId,
      message: 'Message deleted successfully'
    });

  } catch (error) {
    console.error('Message deletion error:', error);
    return createResponse(
      { error: 'Failed to delete message', message: error.message },
      { status: 500 }
    );
  }
});

export const messageRoutes = router;