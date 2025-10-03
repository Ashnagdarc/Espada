import { NextRequest, NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Verify this is a user.created event
    if (body.type !== 'user.created') {
      return NextResponse.json({ message: 'Event type not handled' }, { status: 200 });
    }

    const { user } = body.data;
    
    if (!user || !user.id || !user.primary_email) {
      return NextResponse.json({ error: 'Invalid user data' }, { status: 400 });
    }

    // Create customer profile in Supabase
    const { data, error } = await supabaseAdmin
      .from('customer_profiles')
      .insert({
        stack_user_id: user.id,
        email: user.primary_email,
        first_name: user.display_name?.split(' ')[0] || '',
        last_name: user.display_name?.split(' ').slice(1).join(' ') || '',
        role: 'customer', // Default role for new users
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating customer profile:', error);
      return NextResponse.json({ error: 'Failed to create profile' }, { status: 500 });
    }

    console.log('Customer profile created successfully:', data);
    return NextResponse.json({ 
      message: 'User profile created successfully',
      profile: data 
    }, { status: 200 });

  } catch (error) {
    console.error('Webhook error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}