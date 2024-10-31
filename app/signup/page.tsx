"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import Link from "next/link";
import { useAuth } from "@/lib/auth";
import type { UserRole } from "@/lib/auth";

const isWebContainer = process.env.NEXT_PUBLIC_ENV_MODE === 'webcontainer';

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Name must be at least 2 characters.",
  }),
  email: z.string().email({
    message: "Please enter a valid email address.",
  }),
  password: z.string().min(8, {
    message: "Password must be at least 8 characters.",
  }),
  roles: z.array(z.enum(['client', 'service_provider'])).min(1, {
    message: "Please select at least one role.",
  }),
});

export default function SignUp() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();
  const { login } = useAuth();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      password: "",
      roles: [],
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    try {
      // In web container mode, create a mock user with both roles
      if (isWebContainer) {
        const mockUser = {
          id: `mock-user-${Date.now()}`,
          name: values.name,
          email: values.email,
          roles: ['client', 'service_providerovider'] as UserRole[],
          activeRole: 'client' as UserRole,
          token: `mock-token-${Date.now()}`,
        };

        login(mockUser);
        toast.success("Sign up successful!");
        router.push('/dashboard/client');
        return;
      }

      // Regular signup flow for non-web container environments
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(values),
      });

      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to sign up');
      }

      toast.success("Sign up successful! Please log in.");
      router.push('/login');
    } catch (error: any) {
      toast.error(error.message || "Error signing up. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-md mx-auto">
        <h1 className="text-3xl font-bold mb-8">Create an Account</h1>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Full Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input type="email" placeholder="john@example.com" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Password</FormLabel>
                  <FormControl>
                    <Input type="password" placeholder="********" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            {!isWebContainer && (
              <FormField
                control={form.control}
                name="roles"
                render={() => (
                  <FormItem>
                    <FormLabel>I want to...</FormLabel>
                    <div className="space-y-2">
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="client"
                          onCheckedChange={(checked) => {
                            const current = form.getValues().roles;
                            if (checked) {
                              form.setValue('roles', [...current, 'client']);
                            } else {
                              form.setValue('roles', current.filter(r => r !== 'client'));
                            }
                          }}
                        />
                        <label
                          htmlFor="client"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Hire for projects (client)
                        </label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <Checkbox
                          id="service_providerovider"
                          onCheckedChange={(checked) => {
                            const current = form.getValues().roles;
                            if (checked) {
                              form.setValue('roles', [...current, 'service_providerovider']);
                            } else {
                              form.setValue('roles', current.filter(r => r !== 'service_providerovider'));
                            }
                          }}
                        />
                        <label
                          htmlFor="service_providerovider"
                          className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70"
                        >
                          Work on projects (service_providerovider)
                        </label>
                      </div>
                    </div>
                    <FormMessage />
                  </FormItem>
                )}
              />
            )}

            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Creating Account..." : "Create Account"}
            </Button>
          </form>
        </Form>

        <p className="mt-4 text-center text-sm text-muted-foreground">
          Already have an account?{' '}
          <Link href="/login" className="text-primary hover:underline">
            Log in
          </Link>
        </p>
      </div>
    </div>
  );
}