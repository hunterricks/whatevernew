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

    // Generate recovery codes
    const { recovery_codes } = await management.users.generateRecoveryCode({ id: session.user.sub });

    return NextResponse.json({ recovery_codes });
  } catch (error) {
    console.error('Recovery code generation error:', error);
    return NextResponse.json({ error: 'Failed to generate recovery codes' }, { status: 500 });
  }
}