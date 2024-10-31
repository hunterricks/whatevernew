import { withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

const isWebContainer = process.env.NEXT_PUBLIC_ENV_MODE === 'webcontainer';

export async function middleware(request: NextRequest) {
  try {
    // Allow access to the landing page and auth-related routes without authentication
    const publicPaths = ['/', '/login', '/register', '/register/homeowner', '/register/service-provider'];
    const path = request.nextUrl.pathname;

    if (publicPaths.includes(path)) {
      return NextResponse.next();
    }

    if (isWebContainer) {
      return NextResponse.next();
    }
    
    // Apply Auth0 middleware for protected routes
    return withMiddlewareAuthRequired({
      returnTo: '/login',
    })(request);
  } catch (error) {
    console.error('Middleware error:', error);
    
    if (error.code === 'ETIMEDOUT') {
      return new NextResponse(
        JSON.stringify({ error: 'Database connection timeout. Please try again.' }),
        { status: 503 }
      );
    }
    
    return new NextResponse(
      JSON.stringify({ error: 'Internal server error' }),
      { status: 500 }
    );
  }
}

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/profile/:path*',
    '/post-job/:path*',
    '/browse-jobs/:path*',
    '/my-jobs/:path*',
    '/my-proposals/:path*',
    '/messages/:path*',
    '/jobs/:path*',
    '/proposals/:path*',
    '/((?!api|_next/static|_next/image|favicon.ico).*)',
  ],
};