import { loginWithRedirect } from "@/lib/auth/auth0-client";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";

export function AuthButtons() {
  const handleSocialLogin = async (connection: string) => {
    try {
      await loginWithRedirect({
        authorizationParams: {
          connection,
        },
      });
    } catch (error) {
      console.error("Social login error:", error);
    }
  };

  return (
    <div className="grid gap-4">
      <Button
        variant="outline"
        onClick={() => handleSocialLogin("google-oauth2")}
      >
        <Icons.google className="mr-2 h-4 w-4" />
        Continue with Google
      </Button>
      <Button
        variant="outline"
        onClick={() => handleSocialLogin("apple")}
      >
        <Icons.apple className="mr-2 h-4 w-4" />
        Continue with Apple
      </Button>
    </div>
  );
}
