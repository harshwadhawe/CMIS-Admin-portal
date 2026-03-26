import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';
const JWT_EXPIRES_IN = '10h'; // 10 hours

export interface JWTPayload {
  userId: string;
  username: string;
  role?: string;
}

/**
 * Generate a JWT token for a user
 */
export function generateToken(payload: JWTPayload): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyToken(token: string): JWTPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    return null;
  }
}

/**
 * Get token expiration time in seconds (10 hours = 36000 seconds)
 */
export function getTokenExpiration(): number {
  return 10 * 60 * 60; // 10 hours in seconds
}

