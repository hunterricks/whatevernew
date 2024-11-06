"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { LoginButton } from "../../components/login-button";
import { ArrowLeft } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { getAuth0Client } from '@/lib/auth/auth0-client';

const formSchema = z.object({
  firstName: z.string().min(2, "First name is required"),
  lastName: z.string().min(2, "Last name is required"),
  email: z.string().email("Invalid email address"),
  password: z.string().min(8, "Password must be at least 8 characters"),
  country: z.string().min(1, "Country is required"),
  emailUpdates: z.boolean().default(true),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function ClientRegisterPage() {
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      country: "",
      emailUpdates: true,
      termsAccepted: false,
    },
  });

  const handleSubmit = async (values: FormData) => {
    setIsSubmitting(true);
    
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          firstName: values.firstName,
          lastName: values.lastName,
          email: values.email,
          password: values.password,
          country: values.country,
          role: 'client',
          emailUpdates: values.emailUpdates,
          termsAccepted: values.termsAccepted
        })
      });

      const data = await response.json();

      if (data.success && data.credentials) {
        // Try direct token exchange instead of Auth0 redirect
        const tokenResponse = await fetch(`${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/oauth/token`, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            grant_type: 'password',
            username: data.credentials.email,
            password: data.credentials.password,
            client_id: process.env.NEXT_PUBLIC_AUTH0_CLIENT_ID,
            client_secret: process.env.AUTH0_CLIENT_SECRET,
            audience: `${process.env.NEXT_PUBLIC_AUTH0_ISSUER_BASE_URL}/api/v2/`,
            scope: 'openid profile email'
          })
        });

        if (tokenResponse.ok) {
          const tokens = await tokenResponse.json();
          localStorage.setItem('access_token', tokens.access_token);
          if (tokens.id_token) {
            localStorage.setItem('id_token', tokens.id_token);
          }
          router.push(data.redirect_url);
        } else {
          // Only fallback to Auth0 redirect if token exchange fails
          const auth0 = getAuth0Client();
          if (!auth0) {
            throw new Error('Auth0 client not initialized');
          }
          await auth0.loginWithRedirect({
            authorizationParams: {
              login_hint: data.credentials.email,
              prompt: 'none', // Try to skip the login screen
            },
            appState: {
              returnTo: data.redirect_url
            }
          });
        }
      } else {
        toast.error(data.error || 'Registration failed');
      }
    } catch (error) {
      console.error('Registration error:', error);
      toast.error('Failed to register. Please try again.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="container max-w-md mx-auto space-y-4 p-4">
      <Link href="/register">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Sign up to hire talent</h1>
        <p className="text-muted-foreground">Post jobs and hire skilled service providers</p>
      </div>
      
      <div className="space-y-3">
        <LoginButton 
          role="client"
          provider="apple"
          variant="outline"
          size="lg"
          className="w-full"
          label="Continue with Apple"
        />
        
        <LoginButton 
          role="client"
          provider="google"
          variant="outline"
          size="lg"
          className="w-full"
          label="Continue with Google"
        />
      </div>

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

      <form onSubmit={form.handleSubmit(handleSubmit)} className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <label className="text-sm font-medium">First name</label>
            <Input 
              {...form.register("firstName")}
              placeholder="First name" 
            />
            {form.formState.errors.firstName && (
              <p className="text-sm text-red-500">{form.formState.errors.firstName.message}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Last name</label>
            <Input 
              {...form.register("lastName")}
              placeholder="Last name" 
            />
            {form.formState.errors.lastName && (
              <p className="text-sm text-red-500">{form.formState.errors.lastName.message}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Work email address</label>
          <Input 
            {...form.register("email")}
            type="email" 
            placeholder="Work email address" 
          />
          {form.formState.errors.email && (
            <p className="text-sm text-red-500">{form.formState.errors.email.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Password</label>
          <div className="relative">
            <Input 
              {...form.register("password")}
              type={showPassword ? "text" : "password"} 
              placeholder="Password (8 or more characters)"
            />
            <Button
              type="button"
              variant="ghost"
              size="sm"
              className="absolute right-2 top-1/2 -translate-y-1/2"
              onClick={() => setShowPassword(!showPassword)}
            >
              {showPassword ? "Hide" : "Show"}
            </Button>
          </div>
          {form.formState.errors.password && (
            <p className="text-sm text-red-500">{form.formState.errors.password.message}</p>
          )}
        </div>

        <div className="space-y-2">
          <label className="text-sm font-medium">Country</label>
          <Select onValueChange={(value) => form.setValue("country", value)}>
            <SelectTrigger>
              <SelectValue placeholder="Select your country" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="us">United States</SelectItem>
              <SelectItem value="ca">Canada</SelectItem>
              <SelectItem value="uk">United Kingdom</SelectItem>
            </SelectContent>
          </Select>
          {form.formState.errors.country && (
            <p className="text-sm text-red-500">{form.formState.errors.country.message}</p>
          )}
        </div>

        <div className="flex items-start space-x-2">
          <Checkbox
            id="terms"
            checked={form.watch("termsAccepted")}
            onCheckedChange={(checked) => form.setValue("termsAccepted", checked as boolean)}
          />
          <label htmlFor="terms" className="text-sm">
            Yes, I understand and agree to the{" "}
            <Link href="/terms" className="text-primary hover:underline">
              Terms of Service
            </Link>
            , including the{" "}
            <Link href="/user-agreement" className="text-primary hover:underline">
              User Agreement
            </Link>
            {" "}and{" "}
            <Link href="/privacy" className="text-primary hover:underline">
              Privacy Policy
            </Link>
            .
          </label>
          {form.formState.errors.termsAccepted && (
            <p className="text-sm text-red-500">{form.formState.errors.termsAccepted.message}</p>
          )}
        </div>

        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={isSubmitting}
        >
          {isSubmitting ? "Creating account..." : "Create my account"}
        </Button>
      </form>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Log In
        </Link>
      </div>
    </div>
  );
}