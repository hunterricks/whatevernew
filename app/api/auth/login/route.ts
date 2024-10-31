import { handleLogin } from '@auth0/nextjs-auth0';

export async function GET(request: Request) {
  try {
    return await handleLogin(request);
  } catch (error) {
    console.error('Login error:', error);
    return new Response('Login failed', { status: 500 });
  }
}
