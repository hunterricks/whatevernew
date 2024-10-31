'use client';

import { useState, useEffect } from 'react';
import { useAuth0 } from '@auth0/auth0-react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Icons } from "@/components/icons";

export default function OnboardingPage() {
  const { user, getAccessTokenSilently } = useAuth0();
  const router = useRouter();
  const [selectedRole, setSelectedRole] = useState<'client' | 'service_provider' | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const checkUserStatus = async () => {
      try {
        const token = await getAccessTokenSilently();
        const response = await fetch('/api/user/metadata', {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        });
        const data = await response.json();

        // If onboarding is already completed, redirect to appropriate dashboard
        if (data.onboarding_completed) {
          const role = user?.['https://whatever.com/roles']?.[0];
          router.push(role === 'service_provider' ? '/dashboard/service-provider' : '/dashboard/client');
          return;
        }

        // Check email verification
        if (!user?.email_verified) {
          toast.warning('Please verify your email to continue');
        }
      } catch (error) {
        console.error('Error checking user status:', error);
        toast.error('Something went wrong');
      }
    };

    if (user) {
      checkUserStatus();
    }
  }, [user, getAccessTokenSilently, router]);

  const handleRoleSelection = async (role: 'client' | 'service_provider') => {
    setLoading(true);
    try {
      const token = await getAccessTokenSilently();
      
      // Update user metadata with role
      await fetch('/api/user/metadata', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({
          role: role,
          onboarding_started: true,
        }),
      });

      // Redirect to role-specific onboarding
      router.push(`/onboarding/${role}`);
    } catch (error) {
      console.error('Error setting role:', error);
      toast.error('Failed to set role. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container max-w-4xl mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold text-center mb-8">Welcome to WHATEVER™</h1>
      <p className="text-muted-foreground text-center mb-12">
        Choose how you'd like to use our platform
      </p>

      <div className="grid md:grid-cols-2 gap-6">
        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <Button
            variant="ghost"
            className="w-full h-full"
            onClick={() => handleRoleSelection('client')}
            disabled={loading}
          >
            <div className="text-left">
              <Icons.user className="w-12 h-12 mb-4" />
              <h2 className="text-xl font-semibold mb-2">I need services</h2>
              <p className="text-muted-foreground">
                Find and hire qualified service providers for your projects
              </p>
            </div>
          </Button>
        </Card>

        <Card className="p-6 hover:shadow-lg transition-shadow cursor-pointer">
          <Button
            variant="ghost"
            className="w-full h-full"
            onClick={() => handleRoleSelection('service_provider')}
            disabled={loading}
          >
            <div className="text-left">
              <Icons.tools className="w-12 h-12 mb-4" />
              <h2 className="text-xl font-semibold mb-2">I provide services</h2>
              <p className="text-muted-foreground">
                Offer your services and connect with potential clients
              </p>
            </div>
          </Button>
        </Card>
      </div>
    </div>
  );
}
