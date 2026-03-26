import { NextRequest } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { query } from '@/lib/db-connection';

// GET /api/students - Get all students with full details
// Query parameters:
//   - id: Get specific student by student_id
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return createErrorResponse(auth.error || 'Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const studentId = searchParams.get('id');

    let result;
    let message = '';

    if (studentId) {
      // Get specific student by ID
      result = await query(
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
        WHERE student_id = $1
        ORDER BY name ASC`,
        [studentId]
      );
      message = result.rows.length > 0 
        ? 'Student retrieved successfully' 
        : 'Student not found';
    } else {
      // Get all students
      result = await query(
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
        ORDER BY name ASC`,
        []
      );
      message = `Found ${result.rows.length} student(s)`;
    }

    // Transform the results to camelCase format
    const students = result.rows.map((row) => ({
      studentId: row.student_id.toString(),
      uin: row.uin || undefined,
      email: row.email || undefined,
      degreeType: row.degree_type || undefined,
      academicLevel: row.academic_level || undefined,
      programOfStudy: row.program_of_study || undefined,
      graduationYear: row.graduation_year || undefined,
      needMentorship: row.need_mentorship || undefined,
      domainInterests: row.domain_interests || undefined,
      targetIndustries: row.target_industries || undefined,
      resumePath: row.resume_path || undefined,
      resumePathKey: row.resume_path_key || undefined,
      createdAt: row.created_at || undefined,
      updatedAt: row.updated_at || undefined,
      profileSummary: row.profile_summary || undefined,
      profileSummaryEmbedding: row.profile_summary_embedding || undefined,
      linkedinUrl: row.linkedin_url || undefined,
      gpa: row.gpa || undefined,
      skills: row.skills || undefined,
      password: row.password || undefined, // Note: Consider removing this in production
      isRegistered: row.is_registrered || undefined,
      name: row.name || undefined,
    }));

    return createSuccessResponse(students, message);
  } catch (error) {
    console.error('Get students error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/students - Create a new student
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return createErrorResponse(auth.error || 'Unauthorized', 401);
    }

    const body = await request.json();
    const {
      uin,
      email,
      degreeType,
      academicLevel,
      programOfStudy,
      graduationYear,
      needMentorship,
      domainInterests,
      targetIndustries,
      resumePath,
      resumePathKey,
      profileSummary,
      profileSummaryEmbedding,
      linkedinUrl,
      gpa,
      skills,
      password,
      isRegistered,
      name,
    } = body;

    // Validate required fields
    if (!email || !name) {
      return createErrorResponse('email and name are required', 400);
    }

    // Create student
    const result = await query(
      `INSERT INTO cmis_students (
        uin, email, degree_type, academic_level, program_of_study,
        graduation_year, need_mentorship, domain_interests, target_industries,
        resume_path, resume_path_key, profile_summary, profile_summary_embedding,
        linkedin_url, gpa, skills, password, is_registrered, name
      )
      VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13, $14, $15, $16, $17, $18, $19)
      RETURNING *`,
      [
        uin || null,
        email,
        degreeType || null,
        academicLevel || null,
        programOfStudy || null,
        graduationYear || null,
        needMentorship || null,
        domainInterests || null,
        targetIndustries || null,
        resumePath || null,
        resumePathKey || null,
        profileSummary || null,
        profileSummaryEmbedding || null,
        linkedinUrl || null,
        gpa || null,
        skills || null,
        password || null,
        isRegistered || null,
        name,
      ]
    );

    const row = result.rows[0];
    const newStudent = {
      studentId: row.student_id.toString(),
      uin: row.uin || undefined,
      email: row.email || undefined,
      degreeType: row.degree_type || undefined,
      academicLevel: row.academic_level || undefined,
      programOfStudy: row.program_of_study || undefined,
      graduationYear: row.graduation_year || undefined,
      needMentorship: row.need_mentorship || undefined,
      domainInterests: row.domain_interests || undefined,
      targetIndustries: row.target_industries || undefined,
      resumePath: row.resume_path || undefined,
      resumePathKey: row.resume_path_key || undefined,
      createdAt: row.created_at || undefined,
      updatedAt: row.updated_at || undefined,
      profileSummary: row.profile_summary || undefined,
      profileSummaryEmbedding: row.profile_summary_embedding || undefined,
      linkedinUrl: row.linkedin_url || undefined,
      gpa: row.gpa || undefined,
      skills: row.skills || undefined,
      password: row.password || undefined,
      isRegistered: row.is_registrered || undefined,
      name: row.name || undefined,
    };

    return createSuccessResponse(newStudent, 'Student created successfully', 201);
  } catch (error) {
    console.error('Create student error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

