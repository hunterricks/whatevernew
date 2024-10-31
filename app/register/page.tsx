"use client";

import { Card, CardContent } from "@/components/ui/card";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { useEffect } from "react";
import Link from "next/link";
import { Briefcase, HardHat } from "lucide-react";

export default function Register() {
  const router = useRouter();
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      router.push('/dashboard');
    }
  }, [user, router]);

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold mb-2">Join WHATEVER™</h1>
          <p className="text-muted-foreground">Choose how you want to use the platform</p>
        </div>

        <div className="grid gap-4">
          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => router.push('/register/client')}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <Briefcase className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">I'm a client, hiring for a project</h3>
                  <p className="text-sm text-muted-foreground">Post jobs and hire skilled service providers</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="hover:shadow-lg transition-shadow cursor-pointer group" onClick={() => router.push('/register/service-provider')}>
            <CardContent className="p-6">
              <div className="flex items-start gap-4">
                <div className="p-3 rounded-lg bg-primary/10 text-primary group-hover:bg-primary group-hover:text-primary-foreground transition-colors">
                  <HardHat className="h-6 w-6" />
                </div>
                <div>
                  <h3 className="font-semibold mb-1">I'm a service provider, looking for work</h3>
                  <p className="text-sm text-muted-foreground">Find projects and submit proposals</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <div className="text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Log In
          </Link>
        </div>
      </div>
    </div>
  );
}