import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';
import { getSession } from '@auth0/nextjs-auth0/edge';

export async function loggerMiddleware(req: NextRequest) {
  const startTime = Date.now();
  const res = NextResponse.next();
  const session = await getSession(req, res);
  
  // Basic request info
  const logData = {
    timestamp: new Date().toISOString(),
    method: req.method,
    path: req.nextUrl.pathname,
    query: Object.fromEntries(req.nextUrl.searchParams),
    userAgent: req.headers.get('user-agent'),
    ip: req.ip || req.headers.get('x-forwarded-for'),
    userId: session?.user?.sub,
    role: session?.user?.['https://whatever.com/roles']?.[0],
    duration: Date.now() - startTime,
    status: res.status,
  };

  // Log security events
  if (
    req.nextUrl.pathname.startsWith('/api/') || 
    req.nextUrl.pathname.startsWith('/auth/')
  ) {
    console.log('Security Event:', JSON.stringify(logData, null, 2));

    // Optional: Send to logging service
    if (process.env.LOGGING_ENDPOINT) {
      try {
        await fetch(process.env.LOGGING_ENDPOINT, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(logData),
        });
      } catch (error) {
        console.error('Error sending logs:', error);
      }
    }
  }

  return res;
}