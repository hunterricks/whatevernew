"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Home, Briefcase } from "lucide-react";
import Link from "next/link";
import { AddRole } from "@/components/AddRole";

const isWebContainer = process.env.NEXT_PUBLIC_ENV_MODE === 'webcontainer';

export default function Dashboard() {
  const router = useRouter();
  const { user, checkAuth } = useAuth();

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/login');
      return;
    }
    
    if (!isWebContainer) {
      if (user?.activeRole === 'client') {
        router.push('/dashboard/client');
      } else if (user?.activeRole === 'service_provider') {
        router.push('/dashboard/service-provider');
      }
    }
  }, [user?.activeRole, router, checkAuth]);

  if (!user) {
    return null;
  }

  return (
    <div className="container mx-auto px-4 py-8 mt-16">
      <div className="flex justify-between items-center mb-8 sticky top-20 bg-background z-10 pb-4">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">Welcome back, {user.name}!</p>
      </div>

      {isWebContainer && (
        <Alert variant="warning" className="mb-8">
          <AlertDescription>
            Web Container Mode: Access both client and service provider dashboards
          </AlertDescription>
        </Alert>
      )}

      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        {(user.roles.includes('client') || isWebContainer) && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Home className="h-5 w-5" />
                Client Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">Post jobs and manage your projects.</p>
              <Button asChild className="w-full">
                <Link href="/dashboard/client">Go to Client Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {(user.roles.includes('service_provider') || isWebContainer) && (
          <Card className="hover:shadow-lg transition-shadow">
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Briefcase className="h-5 w-5" />
                Service Provider Dashboard
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="mb-4 text-muted-foreground">Find work and manage your proposals.</p>
              <Button asChild className="w-full">
                <Link href="/dashboard/service-provider">Go to Service Provider Dashboard</Link>
              </Button>
            </CardContent>
          </Card>
        )}

        {!isWebContainer && <AddRole />}
      </div>
    </div>
  );
}