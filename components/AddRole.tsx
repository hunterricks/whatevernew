"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useAuth } from "@/lib/auth";
import { toast } from "sonner";
import { useRouter } from "next/navigation";

export function AddRole() {
  const [isLoading, setIsLoading] = useState(false);
  const { user, login } = useAuth();
  const router = useRouter();

  const addRole = async (newRole: 'client' | 'service_provider') => {
    if (!user) return;

    setIsLoading(true);
    try {
      const response = await fetch('/api/user/add-role', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ role: newRole }),
      });

      if (!response.ok) {
        throw new Error('Failed to add role');
      }

      const data = await response.json();
      
      // Update user in auth store with new role
      login({
        ...user,
        roles: [...user.roles, newRole],
      });

      toast.success("Role added successfully!");
      
      // Redirect to the appropriate onboarding
      router.push(`/${newRole}/onboarding`);
    } catch (error) {
      toast.error("Failed to add role. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const canBecomeClient = !user.roles.includes('client');
  const canBecomeProvider = !user.roles.includes('service_provider');

  if (!canBecomeClient && !canBecomeProvider) return null;

  return (
    <Card>
      <CardHeader>
        <CardTitle>Expand Your Opportunities</CardTitle>
        <CardDescription>
          Add another role to your account to access more features
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        {canBecomeClient && (
          <div className="space-y-2">
            <h3 className="font-medium">Become a Client</h3>
            <p className="text-sm text-muted-foreground">
              Post jobs and hire professionals for your projects
            </p>
            <Button
              onClick={() => addRole('client')}
              disabled={isLoading}
            >
              Add Client Role
            </Button>
          </div>
        )}

        {canBecomeProvider && (
          <div className="space-y-2">
            <h3 className="font-medium">Become a Service Provider</h3>
            <p className="text-sm text-muted-foreground">
              Find work and connect with clients
            </p>
            <Button
              onClick={() => addRole('service_provider')}
              disabled={isLoading}
            >
              Add Provider Role
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}