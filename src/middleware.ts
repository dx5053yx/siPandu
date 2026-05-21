import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

/**
 * Middleware to protect dashboard routes.
 * In production, this would verify Firebase Auth session cookies.
 * For MVP, we allow access and let client-side auth handle protection.
 */
export function middleware(request: NextRequest) {
  // For MVP: allow all requests, client-side auth handles protection
  // TODO: Add Firebase session cookie verification for production
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*'],
};
