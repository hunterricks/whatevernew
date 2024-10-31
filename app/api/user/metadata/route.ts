import { getSession, withApiAuthRequired } from '@auth0/nextjs-auth0';
import { ManagementClient } from 'auth0';
import { NextResponse } from 'next/server';

const management = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN!,
  clientId: process.env.AUTH0_CLIENT_ID!,
  clientSecret: process.env.AUTH0_CLIENT_SECRET!,
});

export const GET = withApiAuthRequired(async function handler(req) {
  try {
    const session = await getSession(req);
    const userId = session?.user.sub;

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = await management.users.get({ id: userId });
    return NextResponse.json(user.data.user_metadata || {});
  } catch (error) {
    console.error('Error fetching user metadata:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});

export const PUT = withApiAuthRequired(async function handler(req) {
  try {
    const session = await getSession(req);
    const userId = session?.user.sub;
    const metadata = await req.json();

    if (!userId) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    await management.users.update({ id: userId }, { user_metadata: metadata });
    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating user metadata:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
});
