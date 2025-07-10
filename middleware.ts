import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'
import jwt from 'jsonwebtoken'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')?.value
  const isAuthPage = request.nextUrl.pathname.startsWith('/login') || 
                     request.nextUrl.pathname.startsWith('/register')
  const isPublicPage = isAuthPage || request.nextUrl.pathname === '/'
  const isApiRoute = request.nextUrl.pathname.startsWith('/api')

  // Skip middleware for API routes (they handle their own auth)
  if (isApiRoute) {
    return NextResponse.next()
  }

  // If no token and trying to access protected page, redirect to login
  if (!token && !isPublicPage) {
    return NextResponse.redirect(new URL('/login', request.url))
  }

  // If has token and trying to access auth pages, redirect to dashboard
  if (token && isAuthPage) {
    try {
      jwt.verify(token, process.env.JWT_SECRET!)
      return NextResponse.redirect(new URL('/dashboard', request.url))
    } catch {
      // Invalid token, let them access auth pages
    }
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}