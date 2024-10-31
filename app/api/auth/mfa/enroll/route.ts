import { getSession } from '@auth0/nextjs-auth0';
import { ManagementClient } from 'auth0';
import { NextResponse } from 'next/server';

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
});

export async function POST(req: Request) {
  try {
    const session = await getSession(req);
    if (!session?.user.sub) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { type } = await req.json();

    // Enable MFA for the user
    await management.updateGuardianEnrollment({
      id: session.user.sub,
      enabled: true,
      phone: type === 'sms' // Only require phone for SMS
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error setting up MFA:', error);
    return NextResponse.json(
      { error: 'Failed to set up MFA' },
      { status: 500 }
    );
  }
}
