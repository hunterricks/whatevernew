import { handleAuth, handleLogin } from '@auth0/nextjs-auth0';
import { NextRequest } from 'next/server';

const isWebContainer = process.env.NEXT_PUBLIC_ENV_MODE === 'webcontainer';

interface RouteContext {
  params: {
    auth0: string[];
  };
}

type RouteHandler = (
  request: NextRequest,
  context: RouteContext
) => Promise<Response>;

const createHandler = (method: string): RouteHandler => {
  return async (request: NextRequest, context: RouteContext) => {
    try {
      if (isWebContainer) {
        return new Response(JSON.stringify({ message: 'Auth skipped in web container' }), {
          status: 200,
          headers: { 'Content-Type': 'application/json' },
        });
      }

      const handlers = {
        async login(req: NextRequest) {
          return handleLogin(req, {
            returnTo: '/',
            authorizationParams: {
              prompt: 'login',
            },
          });
        },
      };

      const auth = handleAuth(handlers);
      return auth(request, context);
    } catch (error) {
      console.error(`Error in ${method} handler:`, error);
      return new Response(JSON.stringify({ error: 'Authentication error' }), {
        status: 500,
        headers: { 'Content-Type': 'application/json' },
      });
    }
  };
};

export const GET: RouteHandler = createHandler('GET');
export const POST: RouteHandler = createHandler('POST');
export const PUT: RouteHandler = createHandler('PUT');
export const DELETE: RouteHandler = createHandler('DELETE');
export const PATCH: RouteHandler = createHandler('PATCH');
export const HEAD: RouteHandler = createHandler('HEAD');
export const OPTIONS: RouteHandler = createHandler('OPTIONS');

export const config = {
  runtime: 'nodejs',
};