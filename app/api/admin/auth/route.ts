import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { generateAdminToken } from '@/lib/jwt';
import { checkRateLimit } from '@/lib/auth-middleware';
import bcrypt from 'bcryptjs';
import { randomBytes } from 'crypto';

// POST /api/admin/auth - Admin login with JWT support
export async function POST(request: NextRequest) {
  try {
    const { username, password } = await request.json();
    
    // Get client IP for rate limiting
    const clientIP = request.headers.get('x-forwarded-for') || 
                    request.headers.get('x-real-ip') || 
                    'unknown';
    
    // Check rate limiting
    if (!checkRateLimit(clientIP)) {
      return NextResponse.json(
        { error: 'Too many login attempts. Please try again later.' },
        { status: 429 }
      );
    }

    // First try to authenticate with Supabase admin_users table
    const { data: adminUser, error } = await supabaseAdmin
      .from('admin_users')
      .select('*')
      .eq('username', username)
      .single();

    if (!error && adminUser) {
      // Verify password with bcrypt
      const isValidPassword = await bcrypt.compare(password, adminUser.password_hash);
      
      if (isValidPassword) {
        // Generate JWT token
        const jwtToken = generateAdminToken({
          adminId: adminUser.id,
          email: adminUser.email || `${username}@espada.com`,
          role: 'admin'
        });
        
        // Also generate legacy session token for backward compatibility
        const sessionToken = randomBytes(32).toString('hex');
        
        return NextResponse.json({
          success: true,
          token: jwtToken,
          sessionToken, // Keep for backward compatibility
          user: {
            id: adminUser.id,
            username: adminUser.username,
            email: adminUser.email,
            role: 'admin'
          },
          message: 'Login successful'
        });
      }
    }

    // Fallback to environment variables for backward compatibility
    const adminUsername = process.env.ADMIN_USERNAME;
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (adminUsername && adminPassword && username === adminUsername && password === adminPassword) {
      // Generate JWT token for legacy admin
      const jwtToken = generateAdminToken({
        adminId: 'legacy-admin',
        email: 'admin@espada.com',
        role: 'admin'
      });
      
      // Generate legacy session token
      const sessionToken = randomBytes(32).toString('hex');
      
      return NextResponse.json({
        success: true,
        token: jwtToken,
        sessionToken, // Keep for backward compatibility
        user: {
          id: 'legacy-admin',
          username: adminUsername,
          email: 'admin@espada.com',
          role: 'admin'
        },
        message: 'Login successful'
      });
    }

    return NextResponse.json(
      { error: 'Invalid credentials' },
      { status: 401 }
    );
  } catch (error) {
    console.error('Error during admin authentication:', error);
    return NextResponse.json(
      { error: 'Authentication failed' },
      { status: 500 }
    );
  }
}