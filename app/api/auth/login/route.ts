import { handleLogin } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

export const runtime = 'nodejs';

export async function GET(request: NextRequest) {
  try {
    console.log('Auth0 Config:', {
      issuerBaseURL: process.env.AUTH0_ISSUER_BASE_URL,
      baseURL: process.env.AUTH0_BASE_URL,
      clientID: process.env.AUTH0_CLIENT_ID?.substring(0, 5) + '...',
    });

    const handler = handleLogin({
      returnTo: '/dashboard',
      authorizationParams: {
        scope: 'openid profile email',
      },
    });

    return handler(request);
  } catch (error) {
    console.error('Login error details:', error);
    return new Response(
      JSON.stringify({ 
        error: 'Login failed', 
        details: error instanceof Error ? error.message : 'Unknown error' 
      }), 
      { 
        status: 500,
        headers: { 'Content-Type': 'application/json' }
      }
    );
  }
}