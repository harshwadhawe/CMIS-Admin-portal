import { NextRequest } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { query } from '@/lib/db-connection';

// PUT /api/outreach-emails/[id] - Update outreach email subject and body
export async function PUT(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return createErrorResponse(auth.error || 'Unauthorized', 401);
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    const body = await request.json();
    const { subject, body: emailBody, to } = body;

    // Validate input - at least one field should be provided
    if (subject === undefined && emailBody === undefined && to === undefined) {
      return createErrorResponse('At least subject, body, or to must be provided for update', 400);
    }

    // First, get the es_id from the outreach email to update the stakeholder email if needed
    const existingEmail = await query(
      'SELECT es_id FROM outreach_emails WHERE outreach_id = $1',
      [id]
    );

    if (existingEmail.rows.length === 0) {
      return createErrorResponse('Outreach email not found', 404);
    }

    const esId = existingEmail.rows[0].es_id;

    // Update stakeholder email if provided (from "to" field)
    if (to !== undefined) {
      await query(
        'UPDATE external_stakeholders SET email = $1 WHERE es_id = $2',
        [to, esId]
      );
    }

    // Build update query dynamically for outreach email
    const updateFields: string[] = [];
    const values: any[] = [];
    let paramCount = 1;

    if (subject !== undefined) {
      updateFields.push(`subject = $${paramCount++}`);
      values.push(subject);
    }

    if (emailBody !== undefined) {
      updateFields.push(`body = $${paramCount++}`);
      values.push(emailBody);
    }

    // Always update updated_by and updated_at
    updateFields.push(`updated_by = $${paramCount++}`);
    values.push(auth.payload?.userId || null);
    updateFields.push(`updated_at = CURRENT_TIMESTAMP`);

    // Add outreach_id as the last parameter
    values.push(id);

    // Update the outreach email
    const result = await query(
      `UPDATE outreach_emails 
       SET ${updateFields.join(', ')} 
       WHERE outreach_id = $${paramCount}
       RETURNING outreach_id, event_id, es_id, subject, body, status, scheduled_send_at, sent_at, created_by, updated_by, created_at, updated_at`,
      values
    );

    if (result.rows.length === 0) {
      return createErrorResponse('Outreach email not found', 404);
    }

    const row = result.rows[0];
    const updatedEmail = {
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

    return createSuccessResponse(updatedEmail, 'Outreach email updated successfully');
  } catch (error) {
    console.error('Update outreach email error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// GET /api/outreach-emails/[id] - Get a specific outreach email by ID
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return createErrorResponse(auth.error || 'Unauthorized', 401);
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    // Get outreach email with stakeholder details
    const result = await query(
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
        es.full_name,
        es.email,
        es.phone
      FROM outreach_emails oe
      INNER JOIN external_stakeholders es ON oe.es_id = es.es_id
      WHERE oe.outreach_id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return createErrorResponse('Outreach email not found', 404);
    }

    const row = result.rows[0];
    const email = {
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
      fullName: row.full_name,
      email: row.email,
      phone: row.phone || undefined,
    };

    return createSuccessResponse(email, 'Outreach email retrieved successfully');
  } catch (error) {
    console.error('Get outreach email by ID error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE /api/outreach-emails/[id] - Delete a specific outreach email
export async function DELETE(
  request: NextRequest,
  { params }: { params: Promise<{ id: string }> | { id: string } }
) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return createErrorResponse(auth.error || 'Unauthorized', 401);
    }

    const resolvedParams = await Promise.resolve(params);
    const { id } = resolvedParams;

    // Delete the outreach email
    const result = await query(
      'DELETE FROM outreach_emails WHERE outreach_id = $1',
      [id]
    );

    if (result.rowCount === 0) {
      return createErrorResponse('Outreach email not found', 404);
    }

    return createSuccessResponse({ id }, 'Outreach email deleted successfully');
  } catch (error) {
    console.error('Delete outreach email error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

