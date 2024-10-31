import { handleAuth, handleLogin } from "@auth0/nextjs-auth0";

export const GET = handleAuth({
  login: handleLogin({
    returnTo: "/api/auth/callback",
    authorizationParams: {
      prompt: "login",
    },
  }),
  onError(req: Request, error: Error) {
    console.error("Auth0 error:", error);
    return Response.redirect("/error?message=auth_failed");
  },
});
