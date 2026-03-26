import { NextRequest } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { query } from '@/lib/db-connection';

// GET /api/outreach-emails?event_id=123 - Get all outreach emails for an event
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return createErrorResponse(auth.error || 'Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const eventId = searchParams.get('event_id');
    const esId = searchParams.get('es_id');

    if (!eventId && !esId) {
      return createErrorResponse('event_id or es_id query parameter is required', 400);
    }

    let result;
    let message = '';

    if (eventId && esId) {
      // Get outreach email details with stakeholder info filtered by both event_id and es_id
      result = await query(
        `SELECT 
          oe.outreach_id,
          oe.event_id,
          oe.es_id,
          oe.subject,
          oe.body,
          oe.status,
          oe.scheduled_send_at,
          oe.sent_at,
          oe.created_by,
          oe.updated_by,
          oe.created_at,
          oe.updated_at,
          es.es_id as stakeholder_es_id,
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
          es.expertise
        FROM outreach_emails oe
        INNER JOIN external_stakeholders es ON oe.es_id = es.es_id
        WHERE oe.event_id = $1 AND oe.es_id = $2
        ORDER BY oe.created_at DESC`,
        [eventId, esId]
      );
      message = `Found ${result.rows.length} outreach email(s) for this event and stakeholder`;
    } else if (eventId) {
      // Get all outreach emails for a specific event with stakeholder details
      result = await query(
        `SELECT 
          oe.outreach_id,
          oe.event_id,
          oe.es_id,
          oe.subject,
          oe.body,
          oe.status,
          oe.scheduled_send_at,
          oe.sent_at,
          oe.created_by,
          oe.updated_by,
          oe.created_at,
          oe.updated_at,
          es.es_id as stakeholder_es_id,
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
          es.expertise
        FROM outreach_emails oe
        INNER JOIN external_stakeholders es ON oe.es_id = es.es_id
        WHERE oe.event_id = $1
        ORDER BY oe.created_at DESC`,
        [eventId]
      );
      message = `Found ${result.rows.length} outreach email(s) for this event`;
    } else if (esId) {
      // Get outreach email details with stakeholder info (all events for this stakeholder)
      result = await query(
        `SELECT 
          oe.outreach_id,
          oe.event_id,
          oe.es_id,
          oe.subject,
          oe.body,
          oe.status,
          oe.scheduled_send_at,
          oe.sent_at,
          oe.created_by,
          oe.updated_by,
          oe.created_at,
          oe.updated_at,
          es.es_id as stakeholder_es_id,
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
          es.expertise
        FROM outreach_emails oe
        INNER JOIN external_stakeholders es ON oe.es_id = es.es_id
        WHERE oe.es_id = $1
        ORDER BY oe.created_at DESC`,
        [esId]
      );
      message = `Found ${result.rows.length} outreach email(s) for this stakeholder`;
    }

    const emails = result.rows.map((row) => {
      const email: any = {
        outreachId: row.outreach_id.toString(),
        eventId: row.event_id.toString(),
        esId: row.es_id.toString(),
        subject: row.subject || undefined,
        body: row.body || undefined,
        status: row.status || 'draft',
        scheduledSendAt: row.scheduled_send_at || undefined,
        sentAt: row.sent_at || undefined,
        createdBy: row.created_by?.toString() || undefined,
        updatedBy: row.updated_by?.toString() || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      // Always include stakeholder details if available
      if (row.full_name || row.stakeholder_es_id) {
        email.stakeholder = {
          esId: (row.stakeholder_es_id || row.es_id).toString(),
          esType: row.es_type || undefined,
          fullName: row.full_name || undefined,
          email: row.email || undefined,
          phone: row.phone || undefined,
          organization: row.organization || undefined,
          title: row.title || undefined,
          location: row.location || undefined,
          graduationYear: row.graduation_year || undefined,
          linkedinUrl: row.linkedin_url || undefined,
          bioText: row.bio_text || undefined,
          bioEmbedding: row.bio_embedding || undefined,
          expertise: row.expertise || undefined,
        };
      }

      return email;
    });

    return createSuccessResponse(emails, message);
  } catch (error) {
    console.error('Get outreach emails error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/outreach-emails - Create a new outreach email
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return createErrorResponse(auth.error || 'Unauthorized', 401);
    }

    const body = await request.json();
    const {
      eventId,
      esId,
      subject,
      body: emailBody,
      status,
      scheduledSendAt,
    } = body;

    // Validate input
    if (!eventId || !esId) {
      return createErrorResponse('eventId and esId are required', 400);
    }

    // Create outreach email
    const result = await query(
      `INSERT INTO outreach_emails (event_id, es_id, subject, body, status, scheduled_send_at, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7)
       RETURNING outreach_id, event_id, es_id, subject, body, status, scheduled_send_at, sent_at, created_by, updated_by, created_at, updated_at`,
      [
        eventId,
        esId,
        subject || null,
        emailBody || null,
        status || 'draft',
        scheduledSendAt || null,
        auth.payload?.userId || null,
      ]
    );

    const row = result.rows[0];
    const newEmail = {
      outreachId: row.outreach_id.toString(),
      eventId: row.event_id.toString(),
      esId: row.es_id.toString(),
      subject: row.subject || undefined,
      body: row.body || undefined,
      status: row.status || 'draft',
      scheduledSendAt: row.scheduled_send_at || undefined,
      sentAt: row.sent_at || undefined,
      createdBy: row.created_by?.toString() || undefined,
      updatedBy: row.updated_by?.toString() || undefined,
      createdAt: row.created_at,
      updatedAt: row.updated_at,
    };

    return createSuccessResponse(newEmail, 'Outreach email created successfully', 201);
  } catch (error) {
    console.error('Create outreach email error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

