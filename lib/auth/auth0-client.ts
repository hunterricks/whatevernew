"use client";

import { Auth0Client } from "@auth0/auth0-spa-js";

let auth0Client: Auth0Client | null = null;

export const getAuth0Client = () => {
  if (typeof window === 'undefined') return null;
  
  if (!auth0Client) {
    const domain = process.env.NEXT_PUBLIC_AUTH0_DOMAIN;
    const clientId = process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID;
    const baseUrl = process.env.NEXT_PUBLIC_APP_URL || window.location.origin;
    
    if (!domain || !clientId) {
      console.error('Missing Auth0 configuration');
      return null;
    }

    auth0Client = new Auth0Client({
      domain,
      clientId,
      authorizationParams: {
        redirect_uri: `${baseUrl}/api/auth/callback`,
        audience: `https://${domain}/api/v2/`,
        scope: 'openid profile email offline_access',
      },
      useRefreshTokens: true,
      cacheLocation: "localstorage"
    });
  }
  
  return auth0Client;
};

export const loginWithRedirect = async (email: string, options = {}) => {
  try {
    await getAuth0Client().loginWithRedirect({
      ...options,
      authorizationParams: {
        ...options.authorizationParams,
        prompt: "login",
        ...(email ? { login_hint: email } : {}),
      },
    });
  } catch (error) {
    console.error("Login error:", error);
    throw error;
  }
};

export const getValidToken = async () => {
  try {
    const token = await getAuth0Client().getTokenSilently({
      detailedResponse: true,
      timeoutInSeconds: 60,
    });
    
    return token.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    // Redirect to login if refresh fails
    await loginWithRedirect(undefined);
    return null;
  }
};

export const setupTokenRefresh = () => {
  // Check token validity every minute
  setInterval(async () => {
    try {
      await getValidToken();
    } catch (error) {
      console.error('Token refresh check failed:', error);
    }
  }, 60000);
};
