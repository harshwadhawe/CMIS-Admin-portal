import { NextRequest } from 'next/server';
import { verifyToken } from './jwt';
import { ApiResponse } from './types';

/**
 * Extract JWT token from request headers
 */
export function getTokenFromRequest(request: NextRequest): string | null {
  const authHeader = request.headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  return null;
}

/**
 * Verify authentication token from request
 */
export function verifyAuth(request: NextRequest): { valid: boolean; payload?: any; error?: string } {
  const token = getTokenFromRequest(request);
  
  if (!token) {
    return { valid: false, error: 'No token provided' };
  }

  const payload = verifyToken(token);
  
  if (!payload) {
    return { valid: false, error: 'Invalid or expired token' };
  }

  return { valid: true, payload };
}

/**
 * Create an error response
 */
export function createErrorResponse(message: string, status: number = 400): Response {
  const response: ApiResponse = {
    success: false,
    error: message,
  };
  return Response.json(response, { status });
}

/**
 * Create a success response
 */
export function createSuccessResponse<T>(data: T, message?: string, status: number = 200): Response {
  const response: ApiResponse<T> = {
    success: true,
    data,
    message,
  };
  return Response.json(response, { status });
}

