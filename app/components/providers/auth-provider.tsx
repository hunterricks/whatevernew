'use client';

import { Auth0Provider } from '@auth0/auth0-react';

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
  const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
  const appUrl = process.env.NEXT_PUBLIC_APP_URL;

  if (!domain || !clientId || !appUrl) {
    console.error('Missing Auth0 configuration');
    return null;
  }

  return (
    <Auth0Provider
      domain={domain}
      clientId={clientId}
      authorizationParams={{
        redirect_uri: `${appUrl}/api/auth/callback`,
        scope: 'openid profile email',
      }}
      cacheLocation="localstorage"
    >
      {children}
    </Auth0Provider>
  );
} 