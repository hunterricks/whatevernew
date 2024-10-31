import { NextResponse } from 'next/server';

export const dynamic = 'force-dynamic';

export async function GET() {
  try {
    // Check Auth0 configuration (without exposing secrets)
    const auth0Config = {
      configured: !!(
        process.env.AUTH0_SECRET &&
        process.env.AUTH0_BASE_URL &&
        process.env.AUTH0_ISSUER_BASE_URL &&
        process.env.AUTH0_CLIENT_ID &&
        process.env.AUTH0_CLIENT_SECRET
      ),
      baseUrl: process.env.AUTH0_BASE_URL,
      issuerBaseUrl: process.env.AUTH0_ISSUER_BASE_URL
    };

    return NextResponse.json({
      success: true,
      auth0: auth0Config,
      endpoints: {
        login: '/api/auth/login',
        callback: '/api/auth/callback',
        logout: '/api/auth/logout'
      }
    });
  } catch (error) {
    console.error('Config check error:', error);
    return NextResponse.json({
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error'
    }, { status: 500 });
  }
}
