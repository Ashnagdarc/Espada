import { NextResponse } from 'next/server';
import { getGeneralSettings } from '@/lib/settings';

// GET /api/settings - Fetch public store settings (non-sensitive data)
export async function GET() {
  try {
    const settings = await getGeneralSettings();
    
    // Only return public-facing settings
    return NextResponse.json({
      storeName: settings.storeName,
      storeDescription: settings.storeDescription,
      contactEmail: settings.contactEmail,
      contactPhone: settings.contactPhone,
      currency: settings.currency
    });
  } catch (error) {
    console.error('Public settings API error:', error);
    // Return defaults on error
    return NextResponse.json({
      storeName: 'Espada',
      storeDescription: 'Your premier online shopping destination',
      contactEmail: 'contact@espada.com',
      contactPhone: '',
      currency: 'USD'
    });
  }
}
