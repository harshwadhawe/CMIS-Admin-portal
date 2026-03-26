// API endpoint to initialize database (run once)
// This can be called manually or will auto-initialize on first use

import { NextRequest } from 'next/server';
import { initializeDatabase } from '@/lib/db-connection';
import { createErrorResponse, createSuccessResponse } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    // Optional: Add authentication check here if needed
    // const auth = verifyAuth(request);
    // if (!auth.valid) {
    //   return createErrorResponse('Unauthorized', 401);
    // }

    await initializeDatabase();
    return createSuccessResponse({}, 'Database initialized successfully');
  } catch (error: any) {
    console.error('Database initialization error:', error);
    return createErrorResponse(
      error.message || 'Failed to initialize database',
      500
    );
  }
}

