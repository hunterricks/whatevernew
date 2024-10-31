'use client';

import { useAuth0 } from "@auth0/auth0-react";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { toast } from "sonner";

export function SocialLogin() {
  const { loginWithPopup } = useAuth0();

  const handleSocialLogin = async (connection: string) => {
    try {
      await loginWithPopup({
        authorizationParams: {
          connection,
          prompt: "select_account",
        },
      });
    } catch (error) {
      console.error("Social login error:", error);
      toast.error("Login failed. Please try again.");
    }
  };

  return (
    <div className="grid grid-cols-2 gap-4">
      <Button
        variant="outline"
        onClick={() => handleSocialLogin("google-oauth2")}
        className="w-full"
      >
        <Icons.google className="mr-2 h-4 w-4" />
        Google
      </Button>
      
      <Button
        variant="outline"
        onClick={() => handleSocialLogin("apple")}
        className="w-full"
      >
        <Icons.apple className="mr-2 h-4 w-4" />
        Apple
      </Button>
    </div>
  );
}
