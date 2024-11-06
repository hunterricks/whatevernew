import { ManagementClient } from 'auth0';

if (!process.env.AUTH0_DOMAIN || !process.env.AUTH0_MANAGEMENT_API_CLIENT_ID || !process.env.AUTH0_MANAGEMENT_API_CLIENT_SECRET) {
  throw new Error('Missing required Auth0 environment variables');
}

export const auth0ManagementClient = new ManagementClient({
  domain: process.env.AUTH0_DOMAIN,
  clientId: process.env.AUTH0_MANAGEMENT_API_CLIENT_ID,
  clientSecret: process.env.AUTH0_MANAGEMENT_API_CLIENT_SECRET,
}); 