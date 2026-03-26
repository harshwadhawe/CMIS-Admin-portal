import { NextRequest } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { query } from '@/lib/db-connection';

// GET /api/mentor-emails - Get mentor emails with full student and mentor details
// Query parameters:
//   - student_id: Filter by student ID
//   - es_id: Filter by external stakeholder (mentor) ID
//   - id: Get specific mentor email by ID
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return createErrorResponse(auth.error || 'Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('student_id');
    const esId = searchParams.get('es_id');
    const id = searchParams.get('id');

    let result;
    let message = '';

    if (id) {
      // Get specific mentor email by ID with full details
      result = await query(
        `SELECT 
          me.id,
          me.student_id,
          me.es_id,
          me.subject,
          me.body,
          me.status,
          me.scheduled_send_at,
          me.sent_at,
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
          -- External stakeholder (mentor) details (all columns from external_stakeholders)
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
        WHERE me.id = $1
        ORDER BY me.created_at DESC`,
        [id]
      );
      message = result.rows.length > 0 
        ? 'Mentor email retrieved successfully' 
        : 'Mentor email not found';
    } else if (studentId && esId) {
      // Get mentor emails filtered by both student_id and es_id
      result = await query(
        `SELECT 
          me.id,
          me.student_id,
          me.es_id,
          me.subject,
          me.body,
          me.status,
          me.scheduled_send_at,
          me.sent_at,
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
        WHERE me.student_id = $1 AND me.es_id = $2
        ORDER BY me.created_at DESC`,
        [studentId, esId]
      );
      message = `Found ${result.rows.length} mentor email(s) for this student and mentor combination`;
    } else if (studentId) {
      // Update status to 'sent' for all mentor emails associated with this student
      await query(
        `UPDATE mentor_emails 
         SET status = 'sent', updated_at = CURRENT_TIMESTAMP 
         WHERE student_id = $1`,
        [studentId]
      );

      // Get all unique external stakeholders (mentors) associated with this student
      // Also get the student details and mentor email status
      result = await query(
        `SELECT DISTINCT
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
          es.expertise,
          me.status,
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
        WHERE me.student_id = $1
        ORDER BY es.full_name ASC`,
        [studentId]
      );
      message = `Found ${result.rows.length} mentor(s) associated with this student. Status updated to 'sent'.`;
    } else if (esId) {
      // Get all mentor emails for a specific mentor (external stakeholder)
      result = await query(
        `SELECT 
          me.id,
          me.student_id,
          me.es_id,
          me.subject,
          me.body,
          me.status,
          me.scheduled_send_at,
          me.sent_at,
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
        WHERE me.es_id = $1
        ORDER BY me.created_at DESC`,
        [esId]
      );
      message = `Found ${result.rows.length} mentor email(s) for this mentor`;
    } else {
      // Get all mentor emails with full details
      result = await query(
        `SELECT 
          me.id,
          me.student_id,
          me.es_id,
          me.subject,
          me.body,
          me.status,
          me.scheduled_send_at,
          me.sent_at,
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
        ORDER BY me.created_at DESC`,
        []
      );
      message = `Found ${result.rows.length} mentor email(s)`;
    }

    // Transform the results to a more structured format
    let transformedData;
    
    if (studentId && !esId && !id) {
      // When filtering by student_id only, return student details with array of mentors
      let studentDetails: any = null;
      const mentors: any[] = [];

      result.rows.forEach((row) => {
        // Extract student details (only need to do this once since it's the same student)
        if (!studentDetails) {
          studentDetails = {};
          Object.keys(row).forEach((key) => {
            // Skip mentor columns
            if (['es_id', 'es_type', 'full_name', 'email', 'phone', 'organization', 'title', 'location', 'graduation_year', 'linkedin_url', 'bio_text', 'bio_embedding', 'expertise'].includes(key)) {
              return; // Skip mentor columns
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
              // Other student columns without prefix (uin, name, gpa, skills, password)
              studentDetails[key] = row[key];
            }
          });
        }

        // Extract mentor details
        const mentor: any = {};
        if (row.es_id) mentor.esId = row.es_id;
        if (row.es_type) mentor.esType = row.es_type;
        if (row.full_name) mentor.fullName = row.full_name;
        if (row.email) mentor.email = row.email;
        if (row.phone) mentor.phone = row.phone;
        if (row.organization) mentor.organization = row.organization;
        if (row.title) mentor.title = row.title;
        if (row.location) mentor.location = row.location;
        if (row.graduation_year) mentor.graduationYear = row.graduation_year;
        if (row.linkedin_url) mentor.linkedinUrl = row.linkedin_url;
        if (row.bio_text) mentor.bioText = row.bio_text;
        if (row.bio_embedding) mentor.bioEmbedding = row.bio_embedding;
        if (row.expertise) mentor.expertise = row.expertise;
        if (row.status) mentor.status = row.status;

        mentors.push(mentor);
      });

      transformedData = {
        student: studentDetails,
        mentors: mentors,
      };
    } else {
      // For other cases, return mentor emails with student and mentor details
      transformedData = result.rows.map((row) => {
        // Extract student details (all columns except mentor_emails and external_stakeholders columns)
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
          } else if (['id', 'student_id', 'es_id', 'subject', 'body', 'status', 'scheduled_send_at', 'sent_at', 'created_by', 'updated_by', 'created_at', 'updated_at'].includes(key)) {
            // Mentor email columns
            if (key === 'student_id') {
              mentorEmailDetails.studentId = row[key];
            } else if (key === 'es_id') {
              mentorEmailDetails.esId = row[key];
            } else if (key === 'scheduled_send_at') {
              mentorEmailDetails.scheduledSendAt = row[key];
            } else if (key === 'sent_at') {
              mentorEmailDetails.sentAt = row[key];
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

        return {
          ...mentorEmailDetails,
          student: studentDetails,
          mentor: mentorDetails,
        };
      });
    }

    return createSuccessResponse(transformedData, message);
  } catch (error) {
    console.error('Get mentor emails error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/mentor-emails - Create a new mentor email
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return createErrorResponse(auth.error || 'Unauthorized', 401);
    }

    const body = await request.json();
    const { studentId, esId, subject, body: emailBody, status, scheduledSendAt, sentBy, createdBy } = body;

    // Validate input
    if (!studentId || !esId) {
      return createErrorResponse('studentId and esId are required', 400);
    }

    // Verify student exists
    const studentCheck = await query(
      'SELECT * FROM cmis_students WHERE student_id = $1',
      [studentId]
    );

    if (studentCheck.rows.length === 0) {
      return createErrorResponse('Student not found', 404);
    }

    // Verify external stakeholder (mentor) exists
    const mentorCheck = await query(
      'SELECT * FROM external_stakeholders WHERE es_id = $1',
      [esId]
    );

    if (mentorCheck.rows.length === 0) {
      return createErrorResponse('Mentor (external stakeholder) not found', 404);
    }

    // Create mentor email
    const result = await query(
      `INSERT INTO mentor_emails (student_id, es_id, subject, body, status, scheduled_send_at, sent_by, created_by)
       VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
       RETURNING *`,
      [studentId, esId, subject || null, emailBody || null, status || 'draft', scheduledSendAt || null, sentBy || null, createdBy || null]
    );

    return createSuccessResponse(
      result.rows[0],
      'Mentor email created successfully',
      201
    );
  } catch (error) {
    console.error('Create mentor email error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

