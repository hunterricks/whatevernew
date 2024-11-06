import { ManagementClient, AuthenticationClient } from 'auth0';

let auth0: {
  management: ManagementClient;
  authentication: AuthenticationClient;
} | null = null;

export function getAuth0() {
  if (!auth0) {
    auth0 = {
      management: new ManagementClient({
        domain: process.env.AUTH0_ISSUER_BASE_URL!,
        clientId: process.env.AUTH0_CLIENT_ID!,
        clientSecret: process.env.AUTH0_CLIENT_SECRET!,
      }),
      authentication: new AuthenticationClient({
        domain: process.env.AUTH0_ISSUER_BASE_URL!,
        clientId: process.env.AUTH0_CLIENT_ID!,
      }),
    };
  }
  return auth0;
} 