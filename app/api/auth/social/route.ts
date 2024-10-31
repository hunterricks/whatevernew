import { handleAuth } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export const GET = handleAuth({
  async login(req) {
    const searchParams = new URL(req.url).searchParams;
    const connection = searchParams.get('connection');
    const returnTo = searchParams.get('returnTo') || '/';
    const role = searchParams.get('role') || 'client';

    try {
      return await handleAuth({
        authorizationParams: {
          connection,
          returnTo,
          state: JSON.stringify({ role, returnTo }),
          // Add scopes based on provider
          scope: connection === 'google-oauth2' 
            ? 'openid profile email' 
            : 'openid profile email',
        },
      })(req);
    } catch (error) {
      console.error('Social login error:', error);
      return NextResponse.redirect(new URL('/auth/error', req.url));
    }
  }
});
