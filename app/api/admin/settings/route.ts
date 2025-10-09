import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// Helper function to check if user is admin
async function isAdmin(authHeader: string | null): Promise<boolean> {
  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return false;
  }

  const token = authHeader.substring(7);
  
  try {
    const { data: { user }, error } = await supabaseAdmin.auth.getUser(token);
    if (error || !user) return false;

    // Check if user exists in customer_profiles table with admin role
    const { data: admin } = await supabaseAdmin
      .from('customer_profiles')
      .select('id')
      .eq('email', user.email)
      .eq('role', 'admin')
      .single();

    return !!admin;
  } catch (error) {
    console.error('Admin check error:', error);
    return false;
  }
}

// GET /api/admin/settings - Fetch all admin settings
export async function GET(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!(await isAdmin(authHeader))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { data: settings, error } = await supabaseAdmin
      .from('admin_settings')
      .select('*');
      
    if (error) {
      console.error('Error fetching settings:', error);
      return NextResponse.json({ error: 'Failed to fetch settings' }, { status: 500 });
    }
    
    // Transform to expected format
    const transformedSettings = settings.reduce((acc: Record<string, unknown>, setting) => {
      if (!acc[setting.category]) acc[setting.category] = {};
      acc[setting.category] = { ...acc[setting.category], ...setting.value };
      return acc;
    }, {});
    
    return NextResponse.json(transformedSettings);
  } catch (error) {
    console.error('Settings API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// PUT /api/admin/settings - Update settings
export async function PUT(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!(await isAdmin(authHeader))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { category, key, value } = body;

    if (!category || !key || value === undefined) {
      return NextResponse.json({ error: 'Missing required fields' }, { status: 400 });
    }

    const { error } = await supabaseAdmin
      .from('admin_settings')
      .upsert({
        category,
        key,
        value,
        updated_at: new Date().toISOString()
      });
      
    if (error) {
      console.error('Error updating settings:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

// POST /api/admin/settings - Bulk update settings
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get('authorization');
    
    if (!(await isAdmin(authHeader))) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const settings = await request.json();

    // Process each category
    const updates = [];
    for (const [category, categoryData] of Object.entries(settings)) {
      updates.push({
        category,
        key: `${category}_config`,
        value: categoryData,
        updated_at: new Date().toISOString()
      });
    }

    const { error } = await supabaseAdmin
      .from('admin_settings')
      .upsert(updates);
      
    if (error) {
      console.error('Error bulk updating settings:', error);
      return NextResponse.json({ error: 'Failed to update settings' }, { status: 500 });
    }
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings bulk update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}