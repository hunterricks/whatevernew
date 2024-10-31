"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { toast } from "../components/ui/use-toast";
import { cn } from "@/lib/utils";

interface LoginButtonProps {
  role?: 'client' | 'service_provider';
  provider?: 'google' | 'apple';
  className?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'ghost' | 'link' | 'destructive';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  label?: string;
}
export function LoginButton({ 
  role = 'client', 
  provider, 
  className,
  variant = 'default',
  size = 'default',
  label
}: LoginButtonProps) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    try {
      setIsLoading(true);

      // Create state with nonce for security
      const state = encodeURIComponent(JSON.stringify({
        role,
        returnTo: `/${role}/onboarding`,
        nonce: Math.random().toString(36).substring(2)
      }));

      const params = new URLSearchParams({
        role,
        state,
        ...(provider && { connection: `${provider}-oauth2` })
      });

      router.push(`/api/auth/login?${params.toString()}`);

    } catch (error) {
      console.error('Login error:', error);
      toast({
        title: "Authentication Error",
        description: "Failed to initiate login. Please try again.",
        variant: "destructive",
      });
    } finally {
      // Keep loading true since we're redirecting
      // setIsLoading(false);
    }
  };

  // Get the appropriate icon
  const Icon = provider ? Icons[provider] : null;
  const LoadingIcon = Icons.spinner;

  // Customize button appearance based on provider
  const buttonStyles = cn(
    className,
    {
      'bg-[#4285F4] hover:bg-[#357ABD]': provider === 'google' && variant === 'default',
      'bg-black hover:bg-gray-800': provider === 'apple' && variant === 'default',
    }
  );
  // Customize button label
  const buttonLabel = label || (provider 
    ? `Continue with ${provider.charAt(0).toUpperCase() + provider.slice(1)}`
    : 'Sign in with email'
  );

  return (
    <Button 
      onClick={handleLogin}
      className={buttonStyles}
      variant={variant}
      size={size}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <LoadingIcon className="mr-2 h-4 w-4 animate-spin" />
          Connecting...
        </>
      ) : (
        <>
          {Icon && (
            <Icon className="mr-2 h-4 w-4" />
          )}
          {buttonLabel}
        </>
      )}
    </Button>
  );
}
// Add loading skeleton for SSR
export function LoginButtonSkeleton() {
  return (
    <div className="w-full h-10 bg-muted animate-pulse rounded-md" />
  );
}

// Add error boundary
export function LoginButtonErrorBoundary() {
  return (
    <Button variant="outline" className="w-full" disabled>
      <Icons.alertCircle className="mr-2 h-4 w-4" />
      Authentication Unavailable
    </Button>
  );
}