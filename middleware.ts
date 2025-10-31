import { createServerClient } from '@supabase/ssr'
import type { CookieOptions } from '@supabase/ssr'
import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export async function middleware(req: NextRequest) {
  let response = NextResponse.next({
    request: {
      headers: req.headers,
    },
  })

  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
        cookies: {
          get(name: string) {
            return req.cookies.get(name)?.value
          },
          set(name: string, value: string, options: CookieOptions) {
            req.cookies.set({
              name,
              value,
              ...options,
            })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value,
            ...options,
          })
        },
          remove(name: string, options: CookieOptions) {
            req.cookies.set({
              name,
              value: '',
              ...options,
          })
          response = NextResponse.next({
            request: {
              headers: req.headers,
            },
          })
          response.cookies.set({
            name,
            value: '',
            ...options,
          })
        },
      },
    }
  )

  // Refresh session if expired - required for Server Components
  const {
    data: { session },
  } = await supabase.auth.getSession()

  const { pathname } = req.nextUrl

  // Define protected routes
  const adminRoutes = ['/admin']
  const customerRoutes = ['/account']
  const authRoutes = ['/signin', '/signup']
  const adminAuthRoutes = ['/admin/login', '/admin/accept-invitation']

  // Check if current path is an admin route (excluding admin auth routes)
  const isAdminRoute = adminRoutes.some(route => pathname.startsWith(route)) && 
                      !adminAuthRoutes.some(route => pathname.startsWith(route))
  
  // Check if current path is a customer route
  const isCustomerRoute = customerRoutes.some(route => pathname.startsWith(route))
  
  // Check if current path is an auth route
  const isAuthRoute = authRoutes.some(route => pathname.startsWith(route))
  
  // Check if current path is an admin auth route
  const isAdminAuthRoute = adminAuthRoutes.some(route => pathname.startsWith(route))

  // If user is not authenticated and trying to access protected routes
  if (!session && (isAdminRoute || isCustomerRoute)) {
    const redirectUrl = isAdminRoute ? '/admin/login' : '/signin'
    return NextResponse.redirect(new URL(redirectUrl, req.url))
  }

  // If user is authenticated, check role-based access
  if (session) {
    try {
      // Check if user is admin
      const { data: adminData } = await supabase
        .from('admins')
        .select('user_id')
        .eq('user_id', session.user.id)
        .single()

      const isAdmin = !!adminData

      // Admin trying to access customer routes - redirect to admin dashboard
      if (isAdmin && isCustomerRoute) {
        return NextResponse.redirect(new URL('/admin', req.url))
      }

      // Customer trying to access admin routes - redirect to main site
      if (!isAdmin && isAdminRoute) {
        return NextResponse.redirect(new URL('/', req.url))
      }

      // Authenticated user trying to access auth pages - redirect based on role
      if (isAuthRoute) {
        const redirectUrl = isAdmin ? '/admin' : '/'
        return NextResponse.redirect(new URL(redirectUrl, req.url))
      }

      // Authenticated admin trying to access admin auth pages - redirect to admin dashboard
      if (isAdmin && isAdminAuthRoute) {
        return NextResponse.redirect(new URL('/admin', req.url))
      }

      // Authenticated non-admin trying to access admin auth pages - redirect to home
      if (!isAdmin && isAdminAuthRoute) {
        return NextResponse.redirect(new URL('/', req.url))
      }

    } catch (error) {
      console.error('Error checking user role:', error)
      // On error, allow access but log the issue
    }
  }

  return response
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     * - api routes (handled separately)
     */
    '/((?!_next/static|_next/image|favicon.ico|public/|api/).*)',
  ],
}