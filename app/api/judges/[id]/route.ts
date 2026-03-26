import { NextRequest } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { judgeDb } from '@/lib/db';

// GET /api/judges/[id] - Get a specific judge by ID
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

    // Get judge by ID
    const judge = await judgeDb.findById(id);

    if (!judge) {
      return createErrorResponse('Judge not found', 404);
    }

    return createSuccessResponse(
      {
        id: judge.id,
        esType: judge.esType,
        fullName: judge.fullName,
        email: judge.email, // Email is included here
        phone: judge.phone,
        organization: judge.organization,
        title: judge.title,
        location: judge.location,
        graduationYear: judge.graduationYear,
        linkedinUrl: judge.linkedinUrl,
        bioText: judge.bioText,
        bioEmbedding: judge.bioEmbedding,
      },
      'Judge retrieved successfully'
    );
  } catch (error) {
    console.error('Get judge by ID error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// PUT /api/judges/[id] - Update a judge by ID
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
    const { esType, fullName, email, phone, organization, title, location, graduationYear, linkedinUrl, bioText, bioEmbedding } = body;

    // Update judge
    const updatedJudge = await judgeDb.update(id, {
      esType,
      fullName,
      email,
      phone,
      organization,
      title,
      location,
      graduationYear,
      linkedinUrl,
      bioText,
      bioEmbedding,
    });

    if (!updatedJudge) {
      return createErrorResponse('Judge not found', 404);
    }

    return createSuccessResponse(updatedJudge, 'Judge updated successfully');
  } catch (error) {
    console.error('Update judge error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// DELETE /api/judges/[id] - Delete a judge by ID
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

    const deleted = await judgeDb.delete(id);

    if (!deleted) {
      return createErrorResponse('Judge not found', 404);
    }

    return createSuccessResponse({ id }, 'Judge deleted successfully');
  } catch (error) {
    console.error('Delete judge error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

