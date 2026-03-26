import { NextRequest } from 'next/server';
import { verifyAuth, createErrorResponse, createSuccessResponse } from '@/lib/auth';
import { judgeDb } from '@/lib/db';
import { ExternalStakeholder } from '@/lib/types';

// GET /api/judges - Get external stakeholders (optionally filtered by type)
export async function GET(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return createErrorResponse(auth.error || 'Unauthorized', 401);
    }

    const { searchParams } = new URL(request.url);
    const esType = searchParams.get('es_type');
    const id = searchParams.get('id');

    let stakeholders: ExternalStakeholder[] = [];

    if (id) {
      // Get specific stakeholder by ID
      const stakeholder = await judgeDb.findById(id);
      if (stakeholder) {
        stakeholders = [stakeholder];
      }
    } else if (esType) {
      // Get stakeholders filtered by type
      stakeholders = await judgeDb.findByType(esType);
    } else {
      // Get all stakeholders
      stakeholders = await judgeDb.findAll();
    }

    return createSuccessResponse(stakeholders, 'External stakeholders retrieved successfully');
  } catch (error) {
    console.error('Get external stakeholders error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

// POST /api/judges - Create a new external stakeholder
export async function POST(request: NextRequest) {
  try {
    // Verify authentication
    const auth = verifyAuth(request);
    if (!auth.valid) {
      return createErrorResponse(auth.error || 'Unauthorized', 401);
    }

    const body = await request.json();
    const { esType, fullName, email, phone, organization, title, location, graduationYear, linkedinUrl, bioText, bioEmbedding } = body;

    // Validate input
    if (!esType || !fullName || !email) {
      return createErrorResponse('esType, fullName, and email are required', 400);
    }

    // Create external stakeholder
    const newStakeholder = await judgeDb.create({
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

    return createSuccessResponse(newStakeholder, 'External stakeholder created successfully', 201);
  } catch (error) {
    console.error('Create external stakeholder error:', error);
    return createErrorResponse('Internal server error', 500);
  }
}

