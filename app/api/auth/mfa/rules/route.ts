import { getSession } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export async function GET(req: Request) {
  const session = await getSession(req);
  if (!session?.user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  // Get user role
  const role = session.user['https://whatever.com/roles']?.[0];

  // Define MFA requirements per role
  const mfaRules = {
    'service_provider': {
      required: true,
      allowedFactors: ['webauthn', 'otp'],
      gracePeriod: 7 // days
    },
    'client': {
      required: false,
      allowedFactors: ['webauthn', 'otp', 'sms'],
      gracePeriod: 30 // days
    }
  };

  return NextResponse.json(mfaRules[role as keyof typeof mfaRules] || {
    required: false,
    allowedFactors: ['otp'],
    gracePeriod: 30
  });
}