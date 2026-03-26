import { NextRequest } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { query } from '@/lib/db-connection';

// POST /api/n8n/mentor-matching-trigger - Trigger N8n pipeline for mentor matching
// Frontend should call this with es_id and student_id
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return createErrorResponse(auth.error || 'Unauthorized', 401);
    }

    const body = await request.json();
    const { esId, studentId } = body;

    // Validate input
    if (!esId || !studentId) {
      return createErrorResponse('esId and studentId are required', 400);
    }

    // Get student details
    const studentResult = await query(
      `SELECT 
        student_id,
        uin,
        email,
        degree_type,
        academic_level,
        program_of_study,
        graduation_year,
        need_mentorship,
        domain_interests,
        target_industries,
        resume_path,
        resume_path_key,
        created_at,
        updated_at,
        profile_summary,
        profile_summary_embedding,
        linkedin_url,
        gpa,
        skills,
        password,
        is_registrered,
        name
      FROM cmis_students
      WHERE student_id = $1`,
      [studentId]
    );

    if (studentResult.rows.length === 0) {
      return createErrorResponse('Student not found', 404);
    }

    // Get external stakeholder (mentor) details
    const stakeholderResult = await query(
      `SELECT 
        es_id,
        es_type,
        full_name,
        email,
        phone,
        organization,
        title,
        location,
        graduation_year,
        linkedin_url,
        bio_text,
        bio_embedding,
        expertise
      FROM external_stakeholders
      WHERE es_id = $1`,
      [esId]
    );

    if (stakeholderResult.rows.length === 0) {
      return createErrorResponse('External stakeholder (mentor) not found', 404);
    }

    const student = studentResult.rows[0];
    const stakeholder = stakeholderResult.rows[0];

    // Get N8n webhook URL from environment variables
    const n8nWebhookUrl = process.env.NEXT_PUBLIC_N8N_MENTOR_MATCHING_WEBHOOK_URL || process.env.NEXT_PUBLIC_N8N_WEBHOOK_URL;
    
    if (!n8nWebhookUrl) {
      return createErrorResponse('N8n webhook URL not configured', 500);
    }

    // Prepare payload for N8n
    const n8nPayload = {
      esId: stakeholder.es_id.toString(),
      studentId: student.student_id.toString(),
      mentor: {
        esId: stakeholder.es_id.toString(),
        esType: stakeholder.es_type,
        fullName: stakeholder.full_name,
        email: stakeholder.email,
        phone: stakeholder.phone || null,
        organization: stakeholder.organization || null,
        title: stakeholder.title || null,
        location: stakeholder.location || null,
        graduationYear: stakeholder.graduation_year || null,
        linkedinUrl: stakeholder.linkedin_url || null,
        bioText: stakeholder.bio_text || null,
        bioEmbedding: stakeholder.bio_embedding || null,
        expertise: stakeholder.expertise || null,
      },
      student: {
        studentId: student.student_id.toString(),
        uin: student.uin || null,
        email: student.email || null,
        name: student.name || null,
        degreeType: student.degree_type || null,
        academicLevel: student.academic_level || null,
        programOfStudy: student.program_of_study || null,
        graduationYear: student.graduation_year || null,
        needMentorship: student.need_mentorship || null,
        domainInterests: student.domain_interests || null,
        targetIndustries: student.target_industries || null,
        resumePath: student.resume_path || null,
        resumePathKey: student.resume_path_key || null,
        profileSummary: student.profile_summary || null,
        profileSummaryEmbedding: student.profile_summary_embedding || null,
        linkedinUrl: student.linkedin_url || null,
        gpa: student.gpa || null,
        skills: student.skills || null,
        isRegistered: student.is_registrered || null,
      },
      triggeredByUserId: auth.payload?.userId,
      triggeredAt: new Date().toISOString(),
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
      console.error('N8n mentor matching webhook error:', errorText);
      return createErrorResponse('Failed to trigger N8n mentor matching pipeline', 500);
    }

    const n8nResult = await n8nResponse.json().catch(() => ({}));

    return createSuccessResponse(
      {
        success: true,
        n8nResponse: n8nResult,
        payload: n8nPayload,
      },
      'Mentor matching trigger sent to N8n successfully'
    );
  } catch (error) {
    console.error('N8n mentor matching trigger error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

