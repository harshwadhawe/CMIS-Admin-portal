import { NextRequest } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { query } from '@/lib/db-connection';

// GET /api/mentor-emails/[id] - Get a specific mentor email with full student and mentor details
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

    if (!id) {
      return createErrorResponse('Mentor email ID is required', 400);
    }

    // Get mentor email with full student and mentor details
    const result = await query(
      `SELECT 
        me.id,
        me.student_id,
        me.es_id,
        me.subject,
        me.body,
        me.status,
        me.scheduled_send_at,
        me.sent_by,
        me.created_by,
        me.updated_by,
        me.created_at,
        me.updated_at,
        -- Student details (all columns from cmis_students)
        cs.student_id as student_student_id,
        cs.uin,
        cs.email as student_email,
        cs.degree_type,
        cs.academic_level,
        cs.program_of_study,
        cs.graduation_year as student_graduation_year,
        cs.need_mentorship,
        cs.domain_interests,
        cs.target_industries,
        cs.resume_path,
        cs.resume_path_key,
        cs.created_at as student_created_at,
        cs.updated_at as student_updated_at,
        cs.profile_summary,
        cs.profile_summary_embedding,
        cs.linkedin_url as student_linkedin_url,
        cs.gpa,
        cs.skills,
        cs.password,
        cs.is_registrered,
        cs.name,
        -- External stakeholder (mentor) details
        es.es_id as mentor_es_id,
        es.es_type,
        es.full_name as mentor_full_name,
        es.email as mentor_email,
        es.phone as mentor_phone,
        es.organization as mentor_organization,
        es.title as mentor_title,
        es.location as mentor_location,
        es.graduation_year as mentor_graduation_year,
        es.linkedin_url as mentor_linkedin_url,
        es.bio_text as mentor_bio_text,
        es.bio_embedding as mentor_bio_embedding,
        es.expertise as mentor_expertise
      FROM mentor_emails me
      INNER JOIN cmis_students cs ON me.student_id = cs.student_id
      INNER JOIN external_stakeholders es ON me.es_id = es.es_id
      WHERE me.id = $1`,
      [id]
    );

    if (result.rows.length === 0) {
      return createErrorResponse('Mentor email not found', 404);
    }

    const row = result.rows[0];

    // Transform the result to a structured format
    const studentDetails: any = {};
    const mentorDetails: any = {};
    const mentorEmailDetails: any = {};

    Object.keys(row).forEach((key) => {
      if (key.startsWith('mentor_')) {
        // External stakeholder columns (prefixed with mentor_)
        const originalKey = key.replace('mentor_', '');
        if (originalKey === 'es_id') {
          mentorDetails.esId = row[key];
        } else if (originalKey === 'full_name') {
          mentorDetails.fullName = row[key];
        } else if (originalKey === 'graduation_year') {
          mentorDetails.graduationYear = row[key];
        } else if (originalKey === 'linkedin_url') {
          mentorDetails.linkedinUrl = row[key];
        } else if (originalKey === 'bio_text') {
          mentorDetails.bioText = row[key];
        } else if (originalKey === 'bio_embedding') {
          mentorDetails.bioEmbedding = row[key];
        } else {
          mentorDetails[originalKey] = row[key];
        }
      } else if (key.startsWith('student_')) {
        // Student columns (prefixed with student_)
        const originalKey = key.replace('student_', '');
        if (originalKey === 'student_id') {
          studentDetails.studentId = row[key];
        } else if (originalKey === 'email') {
          studentDetails.email = row[key];
        } else if (originalKey === 'graduation_year') {
          studentDetails.graduationYear = row[key];
        } else if (originalKey === 'linkedin_url') {
          studentDetails.linkedinUrl = row[key];
        } else if (originalKey === 'created_at') {
          studentDetails.createdAt = row[key];
        } else if (originalKey === 'updated_at') {
          studentDetails.updatedAt = row[key];
        } else if (originalKey === 'resume_path_key') {
          studentDetails.resumePathKey = row[key];
        } else if (originalKey === 'profile_summary') {
          studentDetails.profileSummary = row[key];
        } else if (originalKey === 'profile_summary_embedding') {
          studentDetails.profileSummaryEmbedding = row[key];
        } else if (originalKey === 'degree_type') {
          studentDetails.degreeType = row[key];
        } else if (originalKey === 'academic_level') {
          studentDetails.academicLevel = row[key];
        } else if (originalKey === 'program_of_study') {
          studentDetails.programOfStudy = row[key];
        } else if (originalKey === 'need_mentorship') {
          studentDetails.needMentorship = row[key];
        } else if (originalKey === 'domain_interests') {
          studentDetails.domainInterests = row[key];
        } else if (originalKey === 'target_industries') {
          studentDetails.targetIndustries = row[key];
        } else if (originalKey === 'resume_path') {
          studentDetails.resumePath = row[key];
        } else if (originalKey === 'is_registrered') {
          studentDetails.isRegistered = row[key];
        } else {
          studentDetails[originalKey] = row[key];
        }
      } else if (['id', 'student_id', 'es_id', 'subject', 'body', 'status', 'scheduled_send_at', 'sent_by', 'created_by', 'updated_by', 'created_at', 'updated_at'].includes(key)) {
        // Mentor email columns
        if (key === 'student_id') {
          mentorEmailDetails.studentId = row[key];
        } else if (key === 'es_id') {
          mentorEmailDetails.esId = row[key];
        } else if (key === 'scheduled_send_at') {
          mentorEmailDetails.scheduledSendAt = row[key];
        } else if (key === 'sent_by') {
          mentorEmailDetails.sentBy = row[key];
        } else if (key === 'created_by') {
          mentorEmailDetails.createdBy = row[key];
        } else if (key === 'updated_by') {
          mentorEmailDetails.updatedBy = row[key];
        } else if (key === 'created_at') {
          mentorEmailDetails.createdAt = row[key];
        } else if (key === 'updated_at') {
          mentorEmailDetails.updatedAt = row[key];
        } else {
          mentorEmailDetails[key] = row[key];
        }
      } else {
        // Other student columns (without prefix)
        studentDetails[key] = row[key];
      }
    });

    const mentorEmail = {
      ...mentorEmailDetails,
      student: studentDetails,
      mentor: mentorDetails,
    };

    return createSuccessResponse(mentorEmail, 'Mentor email retrieved successfully');
  } catch (error) {
    console.error('Get mentor email error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/mentor-emails/[id] - Update a mentor email (subject and body)
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
    const { subject, body: emailBody, status, scheduledSendAt, sentBy, updatedBy } = body;

    if (!id) {
      return createErrorResponse('Mentor email ID is required', 400);
    }

    // Check if mentor email exists
    const existingCheck = await query(
      'SELECT * FROM mentor_emails WHERE id = $1',
      [id]
    );

    if (existingCheck.rows.length === 0) {
      return createErrorResponse('Mentor email not found', 404);
    }

    // Build update query dynamically based on provided fields
    const updates: string[] = [];
    const values: any[] = [];
    let paramIndex = 1;

    if (subject !== undefined) {
      updates.push(`subject = $${paramIndex++}`);
      values.push(subject);
    }

    if (emailBody !== undefined) {
      updates.push(`body = $${paramIndex++}`);
      values.push(emailBody);
    }

    if (status !== undefined) {
      updates.push(`status = $${paramIndex++}`);
      values.push(status);
    }

    if (scheduledSendAt !== undefined) {
      updates.push(`scheduled_send_at = $${paramIndex++}`);
      values.push(scheduledSendAt);
    }

    if (sentBy !== undefined) {
      updates.push(`sent_by = $${paramIndex++}`);
      values.push(sentBy);
    }

    if (updatedBy !== undefined) {
      updates.push(`updated_by = $${paramIndex++}`);
      values.push(updatedBy);
    }

    if (updates.length === 0) {
      return createErrorResponse('No fields to update', 400);
    }

    // Always update the updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);

    values.push(id);
    const updateQuery = `
      UPDATE mentor_emails 
      SET ${updates.join(', ')}
      WHERE id = $${paramIndex}
      RETURNING *
    `;

    const result = await query(updateQuery, values);

    return createSuccessResponse(
      result.rows[0],
      'Mentor email updated successfully'
    );
  } catch (error) {
    console.error('Update mentor email error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE /api/mentor-emails/[id] - Delete a mentor email
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

    if (!id) {
      return createErrorResponse('Mentor email ID is required', 400);
    }

    // Delete mentor email
    const result = await query(
      'DELETE FROM mentor_emails WHERE id = $1 RETURNING *',
      [id]
    );

    if (result.rows.length === 0) {
      return createErrorResponse('Mentor email not found', 404);
    }

    return createSuccessResponse(
      { id: result.rows[0].id },
      'Mentor email deleted successfully'
    );
  } catch (error) {
    console.error('Delete mentor email error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

