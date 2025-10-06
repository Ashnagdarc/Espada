import { NextResponse } from 'next/server';
import { supabaseAdmin } from '@/lib/supabase-admin';
import { withAuth } from '@/lib/auth-middleware';

// GET /api/admin/customers - Fetch all customers with pagination and filtering
export const GET = withAuth(async (request, admin) => {
  try {
    console.log('🔍 Admin customers API called by:', admin.email);

    const { searchParams } = new URL(request.url);
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');
    const search = searchParams.get('search') || '';
    const status = searchParams.get('status') || '';
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';

    let query = supabaseAdmin
      .from('customer_profiles')
      .select(`
        *,
        customer_addresses(*)
      `, { count: 'exact' });

    // Apply filters
    if (search) {
      query = query.or(`first_name.ilike.%${search}%,last_name.ilike.%${search}%,email.ilike.%${search}%`);
    }

    if (status) {
      query = query.eq('status', status);
    }

    // Apply sorting
    query = query.order(sortBy, { ascending: sortOrder === 'asc' });

    // Apply pagination
    const from = (page - 1) * limit;
    const to = from + limit - 1;
    query = query.range(from, to);

    const { data: customers, error, count } = await query;
      
    if (error) {
      console.error('Error fetching customers:', error);
      return NextResponse.json({ error: 'Failed to fetch customers' }, { status: 500 });
    }
    
    return NextResponse.json({
      customers,
      pagination: {
        page,
        limit,
        total: count || 0,
        totalPages: Math.ceil((count || 0) / limit)
      }
    });
  } catch (error) {
    console.error('Customers API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

// POST /api/admin/customers - Create new customer
export const POST = withAuth(async (request, admin) => {
  try {
    console.log('🔍 Admin customer creation API called by:', admin.email);

    const customerData = await request.json();

    const { data: customer, error } = await supabaseAdmin
      .from('customer_profiles')
      .insert({
        email: customerData.email,
        first_name: customerData.firstName,
        last_name: customerData.lastName,
        phone: customerData.phone,
        address: customerData.address,
        city: customerData.city,
        postal_code: customerData.postalCode,
        country: customerData.country,
        date_of_birth: customerData.dateOfBirth,
        gender: customerData.gender,
        status: customerData.status || 'active',
        preferences: customerData.preferences || {}
      })
      .select()
      .single();
      
    if (error) {
      console.error('Error creating customer:', error);
      return NextResponse.json({ error: 'Failed to create customer' }, { status: 500 });
    }
    
    return NextResponse.json(customer);
  } catch (error) {
    console.error('Customer creation API error:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});