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

    const { code, type } = await req.json();

    // Verify MFA code
    await management.guardian.verifyEnrollmentTicket({
      id: session.user.sub,
      ticket: code,
      type
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error verifying MFA:', error);
    return NextResponse.json(
      { error: 'Failed to verify MFA code' },
      { status: 500 }
    );
  }
}
