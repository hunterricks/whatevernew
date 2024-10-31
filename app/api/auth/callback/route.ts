import { handleAuth, handleCallback } from '@auth0/nextjs-auth0';
import { NextResponse } from 'next/server';

export const GET = handleCallback({
  afterCallback: async (req, session) => {
    // Get user role from custom claim
    const role = session.user['https://whatever.com/roles']?.[0];
    
    // Add role to session
    session.user.role = role;
    
    // Check if user needs onboarding
    if (role === 'service_provider') {
      session.returnTo = '/service-provider/onboarding';
    } else if (role === 'client') {
      session.returnTo = '/client/onboarding';
    } else if (role === 'homeowner') {
      session.returnTo = '/homeowner/onboarding';
    } else {
      session.returnTo = '/signup'; // If no role, redirect to role selection
    }
    
    return session;
  },
});
