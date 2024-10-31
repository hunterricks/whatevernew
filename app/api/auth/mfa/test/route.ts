import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  try {
    const session = await getSession(req);
    if (!session?.user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Test MFA enrollment status
    const mfaEnrolled = session.user['https://whatever.com/mfa_enrolled'];
    
    return NextResponse.json({
      enrolled: mfaEnrolled,
      userId: session.user.sub,
      factors: session.user['https://whatever.com/mfa_factors'] || []
    });
  } catch (error) {
    console.error('MFA test error:', error);
    return NextResponse.json({ error: 'MFA test failed' }, { status: 500 });
  }
}