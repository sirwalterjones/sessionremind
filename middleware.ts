import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import { getCurrentUser } from '@/lib/auth'

// Routes that require authentication
const protectedRoutes = ['/dashboard', '/new', '/admin']

// Public routes (auth pages)
const publicRoutes = ['/login', '/register']

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl
  
  // Check if route needs protection
  const isProtectedRoute = protectedRoutes.some(route => pathname.startsWith(route))
  const isPublicRoute = publicRoutes.some(route => pathname.startsWith(route))
  const isRootRoute = pathname === '/'
  
  // Handle root route - redirect based on authentication status
  if (isRootRoute) {
    const user = await getCurrentUser(request)
    
    if (user) {
      // Authenticated users go to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } else {
      // Non-authenticated users go to login
      return NextResponse.redirect(new URL('/login', request.url))
    }
  }
  
  if (isProtectedRoute) {
    // Check authentication
    const user = await getCurrentUser(request)
    
    if (!user) {
      // Redirect to login
      const loginUrl = new URL('/login', request.url)
      loginUrl.searchParams.set('redirect', pathname)
      return NextResponse.redirect(loginUrl)
    }
  }
  
  if (isPublicRoute) {
    // Check if already authenticated
    const user = await getCurrentUser(request)
    
    if (user) {
      // Redirect to dashboard
      return NextResponse.redirect(new URL('/dashboard', request.url))
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