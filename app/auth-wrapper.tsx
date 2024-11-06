'use client';

import { Auth0Provider } from '@auth0/auth0-react';
import * as Sentry from '@sentry/nextjs';

// Initialize Sentry in client
Sentry.init({
  environment: process.env.NEXT_PUBLIC_ENV || 'development',
});

export function AuthWrapper({ children }: { children: React.ReactNode }) {
  const appUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN!;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!;
  const issuerBaseUrl = process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL!;

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: `${appUrl}/api/auth/callback`,
        audience: `${issuerBaseUrl}/api/v2/`,
        scope: 'openid profile email offline_access'
      }}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
} 