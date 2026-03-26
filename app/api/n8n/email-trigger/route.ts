import { NextRequest } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { eventDb } from '@/lib/db';
import { N8nWebhookPayload } from '@/lib/types';

// POST /api/n8n/email-trigger - Trigger N8n email pipeline
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return createErrorResponse(auth.error || 'Unauthorized', 401);
    }

    const body: N8nWebhookPayload = await request.json();
    const { eventId, eventTitle, recipients, subject, template } = body;

    // Validate input
    if (!eventId || !recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return createErrorResponse('Event ID and recipients array are required', 400);
    }

    // Verify event exists
    const event = await eventDb.findById(eventId);
    if (!event) {
      return createErrorResponse('Event not found', 404);
    }

    // Get N8n webhook URL from environment variables
    const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_EMAIL_TRIGGER_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      return createErrorResponse('N8n webhook URL not configured', 500);
    }

    // Prepare payload for N8n
    const n8nPayload = {
      eventId,
      eventTitle: eventTitle || event.title,
      eventDescription: event.description,
      recipients,
      subject: subject || `CMIS Event: ${event.title}`,
      template: template || 'default',
      timestamp: new Date().toISOString(),
    };

    // Send request to N8n webhook
    const n8nResponse = await fetch(n8nWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(n8nPayload),
    });

    if (!n8nResponse.ok) {
      const errorText = await n8nResponse.text();
      console.error('N8n webhook error:', errorText);
      return createErrorResponse('Failed to trigger N8n email pipeline', 500);
    }

    const n8nResult = await n8nResponse.json().catch(() => ({}));

    return createSuccessResponse(
      {
        success: true,
        n8nResponse: n8nResult,
        payload: n8nPayload,
      },
      'Email trigger sent to N8n successfully'
    );
  } catch (error) {
    console.error('N8n email trigger error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

