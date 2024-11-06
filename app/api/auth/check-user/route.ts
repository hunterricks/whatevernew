import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { email } = body;

    if (!email) {
      return NextResponse.json({ 
        error: 'Email is required' 
      }, { 
        status: 400 
      });
    }

    const domain = process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '').replace('http://', '');
    
    if (!domain) {
      console.error('Missing AUTH0_ISSUER_BASE_URL');
      return NextResponse.json({ 
        error: 'Auth0 configuration error' 
      }, { 
        status: 500 
      });
    }

    // Try to login with a known-invalid password
    const response = await fetch(`https://${domain}/co/authenticate`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Origin': process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000',
        'Auth0-Client': Buffer.from(JSON.stringify({
          name: 'auth0.js',
          version: '9.20.1'
        })).toString('base64')
      },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        credential_type: 'http://auth0.com/oauth/grant-type/password-realm',
        username: email,
        password: 'check_user_only',
        realm: 'Username-Password-Authentication'
      })
    });

    console.log('Auth0 response status:', response.status);
    const responseData = await response.json();
    console.log('Auth0 response:', responseData);

    // A 403 with "Wrong email or password" means user exists
    const userExists = response.status === 403 && 
                      responseData.error === 'access_denied' && 
                      responseData.error_description?.includes('Wrong email or password');

    return NextResponse.json({ 
      exists: userExists 
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 200  // Keep 200 to handle on client
    });
  }
}