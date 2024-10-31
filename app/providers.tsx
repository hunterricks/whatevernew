'use client';

import { ThemeProvider } from "next-themes";
import { Toaster } from "sonner";
import { Auth0Provider } from "@auth0/auth0-react";
import { UserProvider } from '@auth0/nextjs-auth0/client';

export function Providers({ children }: { children: React.ReactNode }) {
  const origin = typeof window !== 'undefined' ? window.location.origin : '';

  return (
    <UserProvider>
      <Auth0Provider
        domain={process.env.NEXT_PUBLIC_AUTH0_DOMAIN!}
        clientId={process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!}
        authorizationParams={{
          redirect_uri: `${origin}/api/auth/callback`,
          scope: "openid profile email read:roles update:roles",
          audience: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/api/v2/`,
        }}
        useRefreshTokens={true}
        cacheLocation="localstorage"
      >
        <ThemeProvider
          attribute="class"
          defaultTheme="system"
          enableSystem
          disableTransitionOnChange
        >
          {children}
          <Toaster />
        </ThemeProvider>
      </Auth0Provider>
    </UserProvider>
  );
}
