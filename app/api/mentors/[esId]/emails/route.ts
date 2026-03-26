import { NextRequest } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { query } from '@/lib/db-connection';

// GET /api/mentors/[esId]/emails - Get all mentor emails for a specific external stakeholder with full details
export async function GET(
  request: NextRequest,
  { params }: { params: Promise<{ esId: string }> | { esId: string } }
) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return createErrorResponse(auth.error || 'Unauthorized', 401);
    }

    const resolvedParams = await Promise.resolve(params);
    const { esId } = resolvedParams;

    if (!esId) {
      return createErrorResponse('esId is required', 400);
    }

    // Get all mentor emails for this external stakeholder with full stakeholder and student details
    const result = await query(
      `SELECT 
        me.id,
        me.student_id,
        me.es_id,
        me.subject,
        me.body,
        me.status,
        me.scheduled_send_at,
        me.created_by,
        me.updated_by,
        me.created_at,
        me.updated_at,
        -- External stakeholder (mentor) details (all columns from external_stakeholders)
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
        es.expertise,
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
        cs.name
      FROM mentor_emails me
      INNER JOIN external_stakeholders es ON me.es_id = es.es_id
      INNER JOIN cmis_students cs ON me.student_id = cs.student_id
      WHERE me.es_id = $1
      ORDER BY me.created_at DESC`,
      [esId]
    );

    if (result.rows.length === 0) {
      // Check if the external stakeholder exists
      const stakeholderCheck = await query(
        'SELECT * FROM external_stakeholders WHERE es_id = $1',
        [esId]
      );

      if (stakeholderCheck.rows.length === 0) {
        return createErrorResponse('External stakeholder not found', 404);
      }

      // Stakeholder exists but has no mentor emails
      const stakeholder = stakeholderCheck.rows[0];
      const stakeholderDetails = {
        esId: stakeholder.es_id.toString(),
        esType: stakeholder.es_type,
        fullName: stakeholder.full_name,
        email: stakeholder.email,
        phone: stakeholder.phone || undefined,
        organization: stakeholder.organization || undefined,
        title: stakeholder.title || undefined,
        location: stakeholder.location || undefined,
        graduationYear: stakeholder.graduation_year || undefined,
        linkedinUrl: stakeholder.linkedin_url || undefined,
        bioText: stakeholder.bio_text || undefined,
        bioEmbedding: stakeholder.bio_embedding || undefined,
        expertise: stakeholder.expertise || undefined,
      };

      return createSuccessResponse(
        {
          stakeholder: stakeholderDetails,
          mentorEmails: [],
        },
        'External stakeholder found but has no mentor emails'
      );
    }

    // Extract stakeholder details (same for all rows)
    const firstRow = result.rows[0];
    const stakeholderDetails = {
      esId: (firstRow.stakeholder_es_id || firstRow.es_id).toString(),
      esType: firstRow.es_type,
      fullName: firstRow.full_name,
      email: firstRow.email,
      phone: firstRow.phone || undefined,
      organization: firstRow.organization || undefined,
      title: firstRow.title || undefined,
      location: firstRow.location || undefined,
      graduationYear: firstRow.graduation_year || undefined,
      linkedinUrl: firstRow.linkedin_url || undefined,
      bioText: firstRow.bio_text || undefined,
      bioEmbedding: firstRow.bio_embedding || undefined,
      expertise: firstRow.expertise || undefined,
    };

    // Transform mentor emails with student details
    const mentorEmails = result.rows.map((row) => {
      const emailDetails: any = {
        id: row.id.toString(),
        studentId: row.student_id.toString(),
        esId: row.es_id.toString(),
        subject: row.subject || undefined,
        body: row.body || undefined,
        status: row.status || 'draft',
        scheduledSendAt: row.scheduled_send_at || undefined,
        createdBy: row.created_by?.toString() || undefined,
        updatedBy: row.updated_by?.toString() || undefined,
        createdAt: row.created_at,
        updatedAt: row.updated_at,
      };

      // Extract student details
      const studentDetails: any = {};
      Object.keys(row).forEach((key) => {
        // Skip mentor email and stakeholder columns
        if (['id', 'student_id', 'es_id', 'subject', 'body', 'status', 'scheduled_send_at', 'created_by', 'updated_by', 'created_at', 'updated_at', 
             'stakeholder_es_id', 'es_type', 'full_name', 'email', 'phone', 'organization', 'title', 'location', 'graduation_year', 'linkedin_url', 'bio_text', 'bio_embedding', 'expertise'].includes(key)) {
          return; // Skip these columns
        }
        
        if (key.startsWith('student_')) {
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
        } else {
          // Other student columns without prefix
          studentDetails[key] = row[key];
        }
      });

      return {
        ...emailDetails,
        student: studentDetails,
      };
    });

    return createSuccessResponse(
      {
        stakeholder: stakeholderDetails,
        mentorEmails: mentorEmails,
      },
      `Found ${mentorEmails.length} mentor email(s) for this external stakeholder`
    );
  } catch (error) {
    console.error('Get mentor emails by es_id error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/mentors/[esId]/emails - Update mentor email details
export async function POST(
  request: NextRequest,
  { params }: { params: Promise<{ esId: string }> | { esId: string } }
) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return createErrorResponse(auth.error || 'Unauthorized', 401);
    }

    const resolvedParams = await Promise.resolve(params);
    const { esId } = resolvedParams;

    const body = await request.json();
    const {
      subject,
      body: emailBody,
      email, // email to update in external_stakeholders table
    } = body;

    // Update external_stakeholders email if provided
    if (email !== undefined) {
      await query(
        'UPDATE external_stakeholders SET email = $1 WHERE es_id = $2',
        [email, esId]
      );
    }

    // Update mentor_emails subject, body, and status for all rows with this es_id
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

    // Always set status to "sent" when API is called successfully
    updates.push(`status = $${paramIndex++}`);
    values.push('sent');

    // Always update the updated_at timestamp
    updates.push(`updated_at = CURRENT_TIMESTAMP`);
    
    // Add es_id to values for WHERE clause
    values.push(esId);
    const updateQuery = `
      UPDATE mentor_emails 
      SET ${updates.join(', ')}
      WHERE es_id = $${paramIndex}
    `;

    await query(updateQuery, values);

    // Get updated stakeholder details
    const updatedStakeholder = await query(
      'SELECT * FROM external_stakeholders WHERE es_id = $1',
      [esId]
    );

    let stakeholderDetails = null;
    if (updatedStakeholder.rows.length > 0) {
      const stakeholder = updatedStakeholder.rows[0];
      stakeholderDetails = {
        esId: stakeholder.es_id.toString(),
        esType: stakeholder.es_type,
        fullName: stakeholder.full_name,
        email: stakeholder.email,
        phone: stakeholder.phone || undefined,
        organization: stakeholder.organization || undefined,
        title: stakeholder.title || undefined,
        location: stakeholder.location || undefined,
        graduationYear: stakeholder.graduation_year || undefined,
        linkedinUrl: stakeholder.linkedin_url || undefined,
        bioText: stakeholder.bio_text || undefined,
        bioEmbedding: stakeholder.bio_embedding || undefined,
        expertise: stakeholder.expertise || undefined,
      };
    }

    return createSuccessResponse(
      {
        stakeholder: stakeholderDetails,
        status: 'sent',
      },
      'Email and mentor email details updated successfully'
    );
  } catch (error) {
    console.error('Update mentor email error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

