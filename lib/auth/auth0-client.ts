import { Auth0Client } from "@auth0/auth0-spa-js";

export const auth0Client = new Auth0Client({
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN!,
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!,
  authorizationParams: {
    redirect_uri: window.location.origin,
    audience: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/api/v2/`,
    scope: 'openid profile email offline_access',
  },
  useRefreshTokens: true,
  cacheLocation: "localstorage",
  tokenRefreshThreshold: 60, // Refresh token 60 seconds before expiry
});

export const loginWithRedirect = async (email: string, options = {}) => {
  try {
    await auth0Client.loginWithRedirect({
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
    const token = await auth0Client.getTokenSilently({
      detailedResponse: true,
      timeoutInSeconds: 60,
    });
    
    return token.access_token;
  } catch (error) {
    console.error('Token refresh error:', error);
    // Redirect to login if refresh fails
    await auth0Client.loginWithRedirect();
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
