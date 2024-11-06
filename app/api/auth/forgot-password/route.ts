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

    // Use Auth0's password reset endpoint
    const response = await fetch(`https://${domain}/dbconnections/change_password`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        email,
        connection: 'Username-Password-Authentication'
      })
    });

    console.log('Auth0 response status:', response.status);
    const responseText = await response.text();
    console.log('Auth0 response:', responseText);

    if (!response.ok) {
      return NextResponse.json({ 
        error: 'Failed to send password reset email' 
      }, { 
        status: 500 
      });
    }

    return NextResponse.json({ 
      success: true,
      message: 'Password reset email sent successfully'
    });

  } catch (error) {
    console.error('Server error:', error);
    return NextResponse.json({ 
      error: 'Server error',
      details: error instanceof Error ? error.message : 'Unknown error'
    }, { 
      status: 500 
    });
  }
} 