export const auth0Config = {
  domain: process.env.NEXT_PUBLIC_AUTH0_DOMAIN!,
  clientId: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID!,
  redirectUri: typeof window !== 'undefined' ? `${window.location.origin}/api/auth/callback` : '',
  scope: "openid profile email read:roles update:roles",
  audience: `https://${process.env.NEXT_PUBLIC_AUTH0_DOMAIN}/api/v2/`,
}; 