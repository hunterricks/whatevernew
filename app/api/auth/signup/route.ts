import { NextRequest, NextResponse } from 'next/server';
import { ManagementClient } from 'auth0';

export const dynamic = 'force-dynamic';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    console.log('Signup Request Body:', body);

    const { 
      firstName, 
      lastName, 
      email, 
      password, 
      country,
      role = 'client'
    } = body;

    const domain = process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '').trim();
    const clientId = process.env.AUTH0_CLIENT_ID;
    
    // Create Auth0 Management Client
    const management = new ManagementClient({
      domain: domain!,
      clientId: process.env.AUTH0_CLIENT_ID!,
      clientSecret: process.env.AUTH0_CLIENT_SECRET!,
    });

    // Create user with Auth0
    const signupResponse = await fetch(`https://${domain}/dbconnections/signup`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id: clientId,
        connection: 'Username-Password-Authentication',
        email: email.toLowerCase().trim(),
        password,
        name: `${firstName} ${lastName}`.trim(),
        given_name: firstName.trim(),
        family_name: lastName.trim(),
        user_metadata: {
          country: country?.trim()
        }
      })
    });

    if (!signupResponse.ok) {
      const errorText = await signupResponse.text();
      console.error('Auth0 Signup Error:', errorText);
      return NextResponse.json({ error: 'Failed to create account' }, { status: signupResponse.status });
    }

    // Get user by email and update roles
    try {
      const users = await management.users.getByEmail(email.toLowerCase().trim());
      console.log('Found users:', users);

      if (users && users.length > 0) {
        const userId = users[0].user_id;
        await management.users.update({ id: userId }, {
          app_metadata: { roles: [role] }
        });
        console.log('Updated roles for user:', userId, 'with role:', role);
      }
    } catch (roleError) {
      console.error('Error updating roles:', roleError);
    }

    return NextResponse.json({
      success: true,
      credentials: {
        email: email.toLowerCase().trim(),
        password
      },
      redirect_url: role === 'service_provider' ? '/dashboard/service-provider' : '/dashboard/client'
    });

  } catch (error) {
    console.error('Signup error:', error);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
