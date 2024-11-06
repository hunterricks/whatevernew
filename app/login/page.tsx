'use client';

import { useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";
import { LoginButton } from "@/components/auth/login-button";
import { Loading } from "@/components/ui/loading";
import { useAuth0 } from "@auth0/auth0-react";

export default function LoginPage() {
  const [loading, setLoading] = useState(false);
  const [emailInput, setEmailInput] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const searchParams = useSearchParams();
  const { loginWithRedirect, isLoading, isAuthenticated } = useAuth0();
  
  const emailParam = searchParams.get('email');

  useEffect(() => {
    if (isAuthenticated) {
      router.push('/dashboard');
    }
    if (emailParam) {
      setEmailInput(emailParam);
      setShowPassword(true);
    }
  }, [isAuthenticated, router, emailParam]);

  const handleEmailSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailInput) {
      toast.error("Please enter an email address");
      return;
    }
    setShowPassword(true);
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      await loginWithRedirect({
        authorizationParams: {
          connection: 'Username-Password-Authentication',
          login_hint: emailInput,
        },
        appState: {
          returnTo: '/api/auth/callback'
        }
      });
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Unable to log in. Please try again.");
      setLoading(false);
    }
  };

  const handleSocialLogin = async (provider: 'google' | 'apple') => {
    try {
      await loginWithRedirect({
        authorizationParams: {
          connection: provider === 'google' ? 'google-oauth2' : 'apple',
          redirect_uri: `${process.env.NEXT_PUBLIC_APP_URL}/api/auth/callback`,
          screen_hint: 'login',
        },
        appState: {
          returnTo: '/dashboard'
        }
      });
    } catch (error) {
      console.error(`${provider} login error:`, error);
      toast.error(`Unable to login with ${provider}. Please try again.`);
    }
  };

  if (isLoading) {
    return <Loading />;
  }

  return (
    <div className="container max-w-md mx-auto min-h-[calc(100vh-4rem)] p-4">
      <Link href="/">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </Link>

      <div className="flex flex-col justify-center min-h-[calc(100vh-10rem)]">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Log in to WHATEVER™</h1>
        </div>

        {!showPassword ? (
          <form onSubmit={handleEmailSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="email"
                placeholder="Email"
                value={emailInput}
                onChange={(e) => setEmailInput(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
            >
              Continue
            </Button>
          </form>
        ) : (
          <form onSubmit={handlePasswordSubmit} className="space-y-4">
            <div className="space-y-2">
              <Input
                type="password"
                placeholder="Password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                required
              />
            </div>
            <Button 
              type="submit" 
              className="w-full" 
              size="lg"
              disabled={loading}
            >
              {loading ? (
                <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                "Log In"
              )}
            </Button>
          </form>
        )}

        <div className="relative my-6">
          <div className="absolute inset-0 flex items-center">
            <span className="w-full border-t" />
          </div>
          <div className="relative flex justify-center text-xs uppercase">
            <span className="bg-background px-2 text-muted-foreground">
              or
            </span>
          </div>
        </div>

        <div className="space-y-3">
          <LoginButton 
            provider="google"
            variant="outline"
            size="lg"
            onClick={() => handleSocialLogin('google')}
            className="w-full"
          />
          
          <LoginButton 
            provider="apple"
            variant="outline"
            size="lg"
            onClick={() => handleSocialLogin('apple')}
            className="w-full"
          />
        </div>

        <div className="text-center text-sm text-muted-foreground mt-6">
          Don't have an account?{' '}
          <Link href="/register" className="text-primary hover:underline">
            Sign Up
          </Link>
        </div>
      </div>
    </div>
  );
}
