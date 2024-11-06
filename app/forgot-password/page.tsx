"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import { ArrowLeft } from "lucide-react";
import Link from "next/link";

export default function ForgotPasswordPage() {
  const [loading, setLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const searchParams = useSearchParams();
  const email = searchParams.get('email') || '';
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      toast.error("Please enter your email address");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Failed to send reset email');
      }

      setEmailSent(true);
      toast.success("Password reset email sent");
    } catch (error) {
      console.error("Password reset error:", error);
      toast.error("Failed to send reset email. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  if (emailSent) {
    return (
      <div className="container max-w-md mx-auto min-h-[calc(100vh-4rem)] p-4">
        <div className="text-center space-y-4">
          <Icons.email className="mx-auto h-12 w-12 text-green-600" />
          <h1 className="text-2xl font-bold">Check your email</h1>
          <p className="text-gray-600">
            We've sent password reset instructions to<br />
            <span className="font-medium">{email}</span>
          </p>
          <p className="text-sm text-gray-500">
            Make sure to check your spam folder if you don't see the email.
          </p>
          <Button 
            onClick={() => router.push('/login')}
            className="mt-4"
          >
            Return to login
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="container max-w-md mx-auto min-h-[calc(100vh-4rem)] p-4">
      <Link href="/login">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back to login
        </Button>
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-2xl font-bold">Reset your password</h1>
        <p className="text-gray-600 mt-2">
          Enter your email address and we'll send you instructions to reset your password.
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <Input
          type="email"
          placeholder="Email address"
          value={email}
          onChange={(e) => router.replace(`/forgot-password?email=${e.target.value}`)}
          required
        />

        <Button 
          type="submit" 
          className="w-full" 
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Reset password"
          )}
        </Button>
      </form>
    </div>
  );
} 