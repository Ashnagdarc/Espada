# Enhanced Authentication System

## Overview

The Espada application now features a robust JWT-based authentication system with backward compatibility for legacy session tokens. This system provides secure admin access while maintaining compatibility with existing frontend implementations.

## Features

### 1. JWT Token Authentication
- **Secure**: Uses industry-standard JWT tokens with configurable expiration
- **Stateless**: No server-side session storage required
- **Scalable**: Supports distributed deployments
- **Configurable**: Customizable secret keys and expiration times

### 2. Backward Compatibility
- **Legacy Support**: Maintains support for existing session token authentication
- **Gradual Migration**: Allows smooth transition from old to new authentication
- **No Breaking Changes**: Existing admin panel continues to work without modifications

### 3. Enhanced Security
- **Rate Limiting**: Prevents brute force attacks with configurable limits
- **Token Refresh**: Automatic token renewal for extended sessions
- **Middleware Protection**: Route-level authentication enforcement
- **Multiple Auth Methods**: Supports both Bearer tokens and custom headers

## API Endpoints

### Authentication

#### POST /api/admin/auth
Login endpoint that returns both JWT and legacy session tokens.

**Request:**
```json
{
  "username": "admin",
  "password": "admin123"
}
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "sessionToken": "ba8c6c5c62eea08962e623c2a34a6740...",
  "user": {
    "id": "160986df-014b-427b-81f6-f2db74bfe47b",
    "username": "admin",
    "email": "admin@espada.com",
    "role": "admin"
  },
  "message": "Login successful"
}
```

#### GET /api/admin/auth/refresh
Check token status and validity.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "valid": true,
  "shouldRefresh": false,
  "user": {
    "id": "160986df-014b-427b-81f6-f2db74bfe47b",
    "email": "admin@espada.com",
    "role": "admin"
  }
}
```

#### POST /api/admin/auth/refresh
Refresh an existing JWT token.

**Headers:**
```
Authorization: Bearer <jwt_token>
```

**Response:**
```json
{
  "success": true,
  "token": "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...",
  "message": "Token refreshed successfully"
}
```

## Authentication Methods

### 1. JWT Bearer Token (Recommended)
```bash
curl -H "Authorization: Bearer <jwt_token>" http://localhost:3000/api/admin/products
```

### 2. Legacy Session Token (Backward Compatibility)
```bash
curl -H "x-admin-session: <session_token>" http://localhost:3000/api/admin/products
```

## Environment Variables

```env
# JWT configuration
JWT_SECRET=espada-jwt-secret-key-2024-secure
JWT_EXPIRES_IN=24h

# Legacy authentication (backward compatibility)
ADMIN_SESSION_SECRET=test-session
ADMIN_USERNAME=admin
ADMIN_PASSWORD=admin123
```

## Security Features

### Rate Limiting
- **Default**: 5 attempts per 15 minutes per IP
- **Configurable**: Can be adjusted in `lib/auth-middleware.ts`
- **Automatic Reset**: Counters reset after the time window

### Token Security
- **Signed**: All JWT tokens are cryptographically signed
- **Expiration**: Tokens have configurable expiration times
- **Issuer/Audience**: Tokens include issuer and audience claims for validation
- **Secure Headers**: Tokens can be passed via Authorization header or custom headers

### Middleware Protection
- **Route-level**: All `/api/admin/*` routes are protected (except auth routes)
- **Automatic**: No need to add authentication checks to individual routes
- **Flexible**: Supports both JWT and legacy authentication methods

## Implementation Details

### Core Files

1. **`lib/jwt.ts`** - JWT token generation and verification utilities
2. **`lib/auth-middleware.ts`** - Authentication middleware and helpers
3. **`middleware.ts`** - Next.js middleware for route protection
4. **`app/api/admin/auth/route.ts`** - Enhanced authentication endpoint
5. **`app/api/admin/auth/refresh/route.ts`** - Token refresh endpoint

### Database Integration

The system integrates with Supabase for admin user management:

```sql
-- Admin users table structure
CREATE TABLE admin_users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  username VARCHAR(50) UNIQUE NOT NULL,
  email VARCHAR(255),
  password_hash TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);
```

### Usage in API Routes

#### With Middleware (Recommended)
```typescript
import { withAuth } from '@/lib/auth-middleware';

export const GET = withAuth(async (request, admin) => {
  // admin object contains: { adminId, email, role }
  // Your route logic here
});
```

#### Manual Authentication
```typescript
import { authenticateAdmin } from '@/lib/auth-middleware';

export async function GET(request: NextRequest) {
  const authResult = await authenticateAdmin(request);
  if (!authResult.success) {
    return authResult.response;
  }
  
  // Your route logic here
}
```

## Migration Guide

### For Frontend Applications

1. **Update Login Flow**: Modify login to use the new `token` field from auth response
2. **Add Token Refresh**: Implement automatic token refresh logic
3. **Update Headers**: Use `Authorization: Bearer <token>` instead of `x-admin-session`
4. **Backward Compatibility**: Legacy `sessionToken` is still available during transition

### For API Routes

1. **Use withAuth**: Replace manual session checks with `withAuth` wrapper
2. **Remove Session Logic**: Remove manual `x-admin-session` header checks
3. **Access Admin Info**: Use the `admin` parameter provided by `withAuth`

## Best Practices

1. **Use JWT Tokens**: Prefer JWT tokens over legacy session tokens for new implementations
2. **Implement Refresh**: Set up automatic token refresh in frontend applications
3. **Secure Storage**: Store tokens securely (httpOnly cookies or secure storage)
4. **Monitor Expiration**: Check token expiration and refresh proactively
5. **Rate Limiting**: Monitor authentication attempts and adjust limits as needed

## Troubleshooting

### Common Issues

1. **Token Expired**: Use the refresh endpoint to get a new token
2. **Invalid Signature**: Check that JWT_SECRET matches between environments
3. **Rate Limited**: Wait for the rate limit window to reset (default: 15 minutes)
4. **Legacy Auth Fails**: Verify ADMIN_SESSION_SECRET environment variable

### Debug Mode

Enable debug logging by setting:
```env
NODE_ENV=development
```

This will log authentication attempts and token verification results to the console.