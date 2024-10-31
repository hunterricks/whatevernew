import { handleAuth } from '@auth0/nextjs-auth0';

export const GET = handleAuth({
  login: {
    returnTo: '/onboarding'
  },
  signup: {
    returnTo: '/register'
  },
  callback: {
    returnTo: '/dashboard'
  }
}); 