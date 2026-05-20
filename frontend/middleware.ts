import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

export function middleware(request: NextRequest) {
  const token = request.cookies.get('token')

  const isPublicPage =
    request.nextUrl.pathname === '/' ||
    request.nextUrl.pathname === '/login' ||
    request.nextUrl.pathname === '/register'

  if (!token && !isPublicPage) {
    return NextResponse.redirect(new URL('/', request.url))
  }

  if (token && isPublicPage) {
    return NextResponse.redirect(new URL('/dashboard', request.url))
  }

  return NextResponse.next()
}

export const config = {
  matcher: [
    '/',
    '/login',
    '/register',
    '/dashboard/:path*',
    '/portfolio/:path*',
    '/transactions/:path*',
  ],
}