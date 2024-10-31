import { handleAuth, handleLogin, HandleCallback } from '@auth0/nextjs-auth0';
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
          // Get role and returnTo from query params
          const url = new URL(req.url);
          const role = url.searchParams.get('role') || 'client';
          const returnTo = url.searchParams.get('returnTo') || `/${role}/onboarding`;

          // Create state object with role and returnTo
          const state = encodeURIComponent(JSON.stringify({
            role,
            returnTo,
            nonce: Math.random().toString(36).substring(2)
          }));

          return handleLogin(req, {
            returnTo,
            authorizationParams: {
              prompt: 'login',
              state,
              // Add connection if specified (e.g., 'google-oauth2', 'apple')
              ...(url.searchParams.get('connection') && {
                connection: url.searchParams.get('connection')
              })
            },
          });
        },

        // Custom callback handler to process role and metadata
        callback: (async (req, res) => {
          try {
            // Get state from Auth0 callback
            const url = new URL(req.url);
            const state = url.searchParams.get('state');
            let stateData = { role: 'client', returnTo: '/client/onboarding' };
            
            if (state) {
              try {
                stateData = JSON.parse(decodeURIComponent(state));
              } catch (e) {
                console.error('Error parsing state:', e);
              }
            }

            // Let Auth0 SDK handle the token exchange
            const session = await handleCallback(req, res, {
              afterCallback: async (req, res, session) => {
                // Enhance session with role information
                return {
                  ...session,
                  user: {
                    ...session.user,
                    role: stateData.role,
                    roles: [stateData.role],
                    active_role: stateData.role
                  }
                };
              }
            });

            // Redirect to appropriate onboarding or return URL
            return Response.redirect(new URL(stateData.returnTo, req.url));
          } catch (error) {
            console.error('Callback error:', error);
            return Response.redirect(new URL('/auth/error', req.url));
          }
        }) as HandleCallback,

        // Handle logout
        logout: async (req) => {
          return handleLogout(req, {
            returnTo: '/'
          });
        }
      };

      const auth = handleAuth(handlers);
      return auth(request, context);
    } catch (error) {
      console.error(`Error in ${method} handler:`, error);
      return new Response(JSON.stringify({ 
        error: 'Authentication error',
        details: error instanceof Error ? error.message : 'Unknown error'
      }), {
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