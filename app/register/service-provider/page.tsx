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

export default function ServiceProviderRegisterPage() {
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

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/auth/signup', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...data,
          name: `${data.firstName} ${data.lastName}`,
          role: 'service_provider',
        }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || 'Registration failed');
      }

      toast.success("Account created successfully!");
      router.push('/service-provider/onboarding');
    } catch (error: any) {
      toast.error(error.message || "Failed to create account");
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
        <h1 className="text-3xl font-bold mb-2">Sign up to find work you love</h1>
        <p className="text-muted-foreground">Connect with clients and grow your business</p>
      </div>
      
      <div className="space-y-3">
        <LoginButton 
          role="service_provider"
          provider="apple"
          variant="outline"
          size="lg"
          className="w-full"
          label="Continue with Apple"
        />
        
        <LoginButton 
          role="service_provider"
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

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
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
          <label className="text-sm font-medium">Email</label>
          <Input 
            {...form.register("email")}
            type="email" 
            placeholder="Email address" 
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
            id="emailUpdates"
            checked={form.watch("emailUpdates")}
            onCheckedChange={(checked) => form.setValue("emailUpdates", checked as boolean)}
          />
          <label htmlFor="emailUpdates" className="text-sm">
            Send me helpful emails to find rewarding work and job leads.
          </label>
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