import { NextRequest, NextResponse } from 'next/server';
import prisma from '@/lib/prisma';

// GET /api/admin/settings - Fetch all admin settings
export async function GET(request: NextRequest) {
  try {
    void request;

    const settings = await prisma.adminSettings.findMany();
    
    // If no settings exist, return empty object with all categories
    if (settings.length === 0) {
      return NextResponse.json({
        general: {},
        notifications: {},
        security: {},
        appearance: {}
      });
    }
    
    // Transform to expected format
    const transformedSettings = settings.reduce((acc: Record<string, unknown>, setting) => {
      if (!acc[setting.category]) acc[setting.category] = {};
      const existing = typeof acc[setting.category] === 'object' && acc[setting.category] !== null
        ? (acc[setting.category] as Record<string, unknown>)
        : {};
      
      let parsedValue;
      try {
        parsedValue = JSON.parse(setting.value);
      } catch {
        parsedValue = setting.value;
      }
      
      const incoming = typeof parsedValue === 'object' && parsedValue !== null
        ? (parsedValue as Record<string, unknown>)
        : { [setting.key]: parsedValue };
      
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

    const valueStr = typeof value === 'object' ? JSON.stringify(value) : String(value);

    await prisma.adminSettings.upsert({
      where: {
        category_key: {
          category,
          key
        }
      },
      update: {
        value: valueStr,
        updatedAt: new Date()
      },
      create: {
        category,
        key,
        value: valueStr
      }
    });
    
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
      const valueStr = JSON.stringify(categoryData);
      updates.push(
        prisma.adminSettings.upsert({
          where: {
            category_key: {
              category,
              key: `${category}_config`
            }
          },
          update: {
            value: valueStr,
            updatedAt: new Date()
          },
          create: {
            category,
            key: `${category}_config`,
            value: valueStr
          }
        })
      );
    }

    await Promise.all(updates);
    
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Settings bulk update API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}