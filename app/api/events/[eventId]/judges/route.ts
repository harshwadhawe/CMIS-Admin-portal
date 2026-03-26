import { NextRequest } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { eventDb, judgeDb } from '@/lib/db';
import { query } from '@/lib/db-connection';

// GET /api/events/[eventId]/judges - Get judges associated with an event
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

    if (!eventId) {
      return createErrorResponse('Event ID is required', 400);
    }

    // Verify event exists
    const event = await eventDb.findById(eventId);
    if (!event) {
      return createErrorResponse(`Event with ID ${eventId} not found`, 404);
    }

    // Get judges associated with this event from external_stakeholders table
    // Include distance from outreach_emails and order by distance ascending
    const result = await query(
      `SELECT
        es.es_id,
        es.es_type,
        es.full_name,
        es.email,
        es.phone,
        es.organization,
        es.title,
        es.location,
        es.graduation_year,
        es.linkedin_url,
        es.bio_text,
        es.bio_embedding,
        oe.distance
      FROM external_stakeholders es
      INNER JOIN outreach_emails oe ON es.es_id = oe.es_id
      WHERE oe.event_id = $1
      ORDER BY oe.distance ASC NULLS LAST`,
      [eventId]
    );

    const judges = result.rows.map((row) => ({
      id: row.es_id.toString(),
      esType: row.es_type,
      fullName: row.full_name,
      email: row.email,
      phone: row.phone || undefined,
      organization: row.organization || undefined,
      title: row.title || undefined,
      location: row.location || undefined,
      graduationYear: row.graduation_year || undefined,
      linkedinUrl: row.linkedin_url || undefined,
      bioText: row.bio_text || undefined,
      bioEmbedding: row.bio_embedding || undefined,
      distance: row.distance !== null && row.distance !== undefined ? row.distance : undefined,
    }));

    return createSuccessResponse(
      judges,
      `Found ${judges.length} judge(s) associated with this event`
    );
  } catch (error) {
    console.error('Get event judges error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/events/[eventId]/judges - Associate a judge with an event
export async function POST(
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

    const body = await request.json();
    const { esId } = body;

    // Validate input
    if (!esId) {
      return createErrorResponse('esId (judge ID) is required', 400);
    }

    // Verify event exists
    const event = await eventDb.findById(eventId);
    if (!event) {
      return createErrorResponse('Event not found', 404);
    }

    // Verify judge exists
    const judge = await judgeDb.findById(esId);
    if (!judge) {
      return createErrorResponse('Judge not found', 404);
    }

    // Check if association already exists in outreach_emails
    const existingCheck = await query(
      'SELECT * FROM outreach_emails WHERE event_id = $1 AND es_id = $2',
      [eventId, esId]
    );

    if (existingCheck.rows.length > 0) {
      return createErrorResponse('Judge is already associated with this event', 409);
    }

    // Create association by creating an outreach email entry
    await query(
      'INSERT INTO outreach_emails (event_id, es_id, status) VALUES ($1, $2, $3)',
      [eventId, esId, 'draft']
    );

    return createSuccessResponse(
      { eventId, esId },
      'Judge successfully associated with event',
      201
    );
  } catch (error) {
    console.error('Associate judge with event error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE /api/events/[eventId]/judges - Remove a judge from an event
export async function DELETE(
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

    const { searchParams } = new URL(request.url);
    const esId = searchParams.get('esId');

    if (!esId) {
      return createErrorResponse('esId (judge ID) is required as query parameter', 400);
    }

    // Remove association by deleting outreach email entries
    const result = await query(
      'DELETE FROM outreach_emails WHERE event_id = $1 AND es_id = $2',
      [eventId, esId]
    );

    if (result.rowCount === 0) {
      return createErrorResponse('Association not found', 404);
    }

    return createSuccessResponse(
      { eventId, esId },
      'Judge successfully removed from event'
    );
  } catch (error) {
    console.error('Remove judge from event error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

