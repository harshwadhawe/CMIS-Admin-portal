import { NextRequest } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { eventDb } from '@/lib/db';

// GET /api/events/[eventId] - Get event by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ eventId: string }> | { eventId: string } }
) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return createErrorResponse(auth.error || 'Unauthorized', 401);
    }

    const resolvedParams = await Promise.resolve(params);
    const { eventId } = resolvedParams;
    const event = await eventDb.findById(eventId);

    if (!event) {
      return createErrorResponse('Event not found', 404);
    }

    return createSuccessResponse(event, 'Event retrieved successfully');
  } catch (error) {
    console.error('Get event by ID error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

