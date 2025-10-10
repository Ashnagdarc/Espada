import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
const supabaseServiceKey = process.env.SUPABASE_SERVICE_ROLE_KEY!;
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

// GET /api/admin/settings - Fetch all admin settings
export async function GET(request: NextRequest) {
  try {
    void request;
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
      const existing = typeof acc[setting.category] === 'object' && acc[setting.category] !== null
        ? (acc[setting.category] as Record<string, unknown>)
        : {};
      const incoming = typeof setting.value === 'object' && setting.value !== null
        ? (setting.value as Record<string, unknown>)
        : {};
      acc[setting.category] = { ...existing, ...incoming };
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