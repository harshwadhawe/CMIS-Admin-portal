import { NextRequest } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { eventDb } from '@/lib/db';

// POST /api/n8n/workflow-trigger - Generic N8n workflow trigger for events
// Frontend should call this AFTER an event is created, passing the eventId
export async function POST(request: NextRequest) {
  try {
    // Require authenticated user
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return createErrorResponse(auth.error || 'Unauthorized', 401);
    }

    const body = await request.json();
    const { eventId, type, payload } = body as {
      eventId?: string;
      type?: string;
      payload?: any;
    };

    if (!eventId) {
      return createErrorResponse('eventId is required', 400);
    }

    // Load event so N8n has full context
    const event = await eventDb.findById(eventId);
    if (!event) {
      return createErrorResponse('Event not found', 404);
    }

    const n8nWebhookUrl = `${process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL}`;
    if (!n8nWebhookUrl) {
      return createErrorResponse('NEXT_PUBLIC_N8N_WEBHOOK_URL not configured', 500);
    }

    const n8nPayload = {
      eventId,
      eventTitle: event.title,
      eventDescription: event.description,
      event,
      type: type || 'event_created',
      payload: payload || {},
      triggeredByUserId: auth.payload?.userId,
      triggeredAt: new Date().toISOString(),
    };

    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('N8n workflow webhook error:', errorText);
      return createErrorResponse('Failed to trigger N8n workflow', 500);
    }

    const n8nResult = await n8nResponse.json().catch(() => ({}));

    return createSuccessResponse(
      {
        success: true,
        n8nResponse: n8nResult,
        payload: n8nPayload,
      },
      'Workflow trigger sent to N8n successfully',
    );
  } catch (error) {
    console.error('N8n workflow trigger error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}


