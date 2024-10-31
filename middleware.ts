import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession, withMiddlewareAuthRequired } from '@auth0/nextjs-auth0/edge';
import { loggerMiddleware } from './middleware/logging';

export default withMiddlewareAuthRequired(async function middleware(req: NextRequest) {
  // Add logging middleware
  const loggerRes = await loggerMiddleware(req);
  if (loggerRes.status !== 200) return loggerRes;

  const res = NextResponse.next();
  const session = await getSession(req, res);
  const path = req.nextUrl.pathname;

  // Get user role from session
  const role = session?.user?.['https://whatever.com/roles']?.[0];

  // Protected routes mapping
  const protectedRoutes = {
    '/dashboard/service-provider': ['service_provider'],
    '/dashboard/client': ['client'],
    '/service-provider/onboarding': ['service_provider'],
    '/client/onboarding': ['client'],
    '/api/service-provider': ['service_provider'],
    '/api/client': ['client'],
  };

  // Check if current path is protected
  for (const [route, allowedRoles] of Object.entries(protectedRoutes)) {
    if (path.startsWith(route) && !allowedRoles.includes(role)) {
      return NextResponse.redirect(new URL('/unauthorized', req.url));
    }
  }

  return res;
});

export const config = {
  matcher: [
    '/dashboard/:path*',
    '/service-provider/:path*',
    '/client/:path*',
    '/api/service-provider/:path*',
    '/api/client/:path*',
  ]
};
