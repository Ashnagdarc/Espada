import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || process.env.ADMIN_SESSION_SECRET || 'fallback-secret';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '24h';

export interface AdminTokenPayload {
  adminId: string;
  email: string;
  role: 'admin';
  iat?: number;
  exp?: number;
}

/**
 * Generate a JWT token for admin authentication
 */
export function generateAdminToken(payload: Omit<AdminTokenPayload, 'iat' | 'exp'>): string {
  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
    issuer: 'espada-admin',
    audience: 'espada-app'
  });
}

/**
 * Verify and decode a JWT token
 */
export function verifyAdminToken(token: string): AdminTokenPayload | null {
  try {
    const decoded = jwt.verify(token, JWT_SECRET, {
      issuer: 'espada-admin',
      audience: 'espada-app'
    }) as AdminTokenPayload;
    
    return decoded;
  } catch (error) {
    console.error('JWT verification failed:', error);
    return null;
  }
}

/**
 * Check if a token is expired
 */
export function isTokenExpired(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as AdminTokenPayload;
    if (!decoded || !decoded.exp) return true;
    
    return Date.now() >= decoded.exp * 1000;
  } catch {
    return true;
  }
}

/**
 * Refresh a token if it's close to expiring (within 1 hour)
 */
export function shouldRefreshToken(token: string): boolean {
  try {
    const decoded = jwt.decode(token) as AdminTokenPayload;
    if (!decoded || !decoded.exp) return true;
    
    const oneHourFromNow = Date.now() + (60 * 60 * 1000);
    return decoded.exp * 1000 < oneHourFromNow;
  } catch {
    return true;
  }
}

/**
 * Extract token from Authorization header or x-admin-session header
 */
export function extractTokenFromHeaders(headers: Headers): string | null {
  // Check Authorization header first (Bearer token)
  const authHeader = headers.get('authorization');
  if (authHeader && authHeader.startsWith('Bearer ')) {
    return authHeader.substring(7);
  }
  
  // Fallback to x-admin-session header for backward compatibility
  const sessionHeader = headers.get('x-admin-session');
  if (sessionHeader) {
    return sessionHeader;
  }
  
  return null;
}