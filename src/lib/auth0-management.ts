import { ManagementClient } from 'auth0';

let managementClient: ManagementClient | null = null;

export async function getManagementClient() {
  if (!managementClient) {
    // Remove any https:// prefix from the domain
    const domain = process.env.AUTH0_ISSUER_BASE_URL?.replace('https://', '').replace('http://', '');
    
    if (!domain || !process.env.AUTH0_CLIENT_ID || !process.env.AUTH0_CLIENT_SECRET) {
      throw new Error('Missing required Auth0 configuration');
    }

    // Get access token for Management API
    const tokenResponse = await fetch(`https://${domain}/oauth/token`, {
      method: 'POST',
      headers: { 'content-type': 'application/json' },
      body: JSON.stringify({
        client_id: process.env.AUTH0_CLIENT_ID,
        client_secret: process.env.AUTH0_CLIENT_SECRET,
        audience: `https://${domain}/api/v2/`,
        grant_type: 'client_credentials'
      })
    });

    if (!tokenResponse.ok) {
      const error = await tokenResponse.text();
      console.error('Token response error:', error);
      throw new Error('Failed to get management token');
    }

    const { access_token } = await tokenResponse.json();

    managementClient = new ManagementClient({
      domain,
      token: access_token,
    });
  }

  return managementClient;
} 