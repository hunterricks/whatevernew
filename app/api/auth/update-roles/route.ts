import { NextRequest, NextResponse } from 'next/server';
import { ManagementClient } from 'auth0';

const auth0 = new ManagementClient({
  domain: process.env.AUTH0_ISSUER_BASE_URL!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
});

export async function POST(request: NextRequest) {
  try {
    const { email, roles } = await request.json();

    // Get user by email
    const users = await auth0.getUsersByEmail(email);
    if (!users || users.length === 0) {
      return NextResponse.json({ 
        error: 'User not found' 
      }, { 
        status: 404 
      });
    }

    const user = users[0];

    // Update user roles in Auth0
    await auth0.updateAppMetadata(user.user_id!, {
      roles: roles
    });

    // Also update your database if needed
    // await updateUserRolesInDatabase(user.user_id, roles);

    return NextResponse.json({ 
      success: true,
      redirectUrl: getRedirectUrl(roles)
    });

  } catch (error) {
    console.error('Update roles error:', error);
    return NextResponse.json({ 
      error: 'Failed to update roles' 
    }, { 
      status: 500 
    });
  }
} 