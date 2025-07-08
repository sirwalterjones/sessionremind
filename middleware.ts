import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/new', '/admin']

// Public routes (auth pages and marketing pages)
const publicRoutes = ['/login', '/register', '/']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if route needs protection
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  const isRootRoute = pathname === '/'
  
  // Handle root route - show homepage to everyone, but add login state awareness
  if (isRootRoute) {
    // Let the homepage handle its own logic for showing different content to logged in users
    return NextResponse.next()
  }
  
  // Skip middleware for API routes and static files
  if (pathname.startsWith('/api/') || 
      pathname.startsWith('/_next/') || 
      pathname.includes('.')) {
    return NextResponse.next()
  }

  // Check for potential redirect loops by looking at referer
  const referer = request.headers.get('referer')
  const isComingFromLogin = referer && referer.includes('/login')
  const isComingFromDashboard = referer && referer.includes('/dashboard')
  
  if (isProtectedRoute) {
    try {
      // Check authentication
      const user = await getCurrentUser(request)
      
      if (!user) {
        // Prevent redirect loop: if coming from login, don't redirect back
        if (isComingFromLogin) {
          console.warn('Potential redirect loop detected: coming from login to protected route')
          return NextResponse.next() // Let the page handle auth client-side
        }
        
        // Redirect to login
        const loginUrl = new URL('/login', request.url)
        loginUrl.searchParams.set('redirect', pathname)
        return NextResponse.redirect(loginUrl)
      }
    } catch (error) {
      console.error('Middleware auth error:', error)
      
      // Prevent redirect loop: if coming from login, don't redirect back
      if (isComingFromLogin) {
        console.warn('Auth error with potential redirect loop detected')
        return NextResponse.next() // Let the page handle auth client-side
      }
      
      // If auth fails, redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  if (isPublicRoute && !isRootRoute) {
    try {
      // Check if already authenticated
      const user = await getCurrentUser(request)
      
      if (user) {
        // Prevent redirect loop: if coming from dashboard, don't redirect back
        if (isComingFromDashboard) {
          console.warn('Potential redirect loop detected: coming from dashboard to public route')
          return NextResponse.next() // Let user stay on login page
        }
        
        // Only redirect to dashboard if we're confident about the user's auth status
        // and not in a potential loop
        if (pathname === '/login' && !request.nextUrl.searchParams.has('redirect')) {
          return NextResponse.redirect(new URL('/dashboard', request.url))
        }
      }
    } catch (error) {
      // If auth check fails, just continue to the public route
      console.error('Middleware auth check error:', error)
      // Don't redirect on auth errors for public routes
    }
  }
  
  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - api (API routes)
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public files (images, etc.)
     */
    '/((?!api|_next/static|_next/image|favicon.ico|.*\\.png$|.*\\.jpg$|.*\\.jpeg$|.*\\.gif$|.*\\.svg$|.*\\.ico$|.*\\.zip$).*)',
  ],
}