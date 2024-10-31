import { handleLogout } from '@auth0/nextjs-auth0';

export async function GET(request: Request) {
  try {
    return await handleLogout(request);
  } catch (error) {
    console.error('Logout error:', error);
    return new Response('Logout failed', { status: 500 });
  }
}
