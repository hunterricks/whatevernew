"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Icons } from "@/components/icons";
import Link from "next/link";

interface PasswordStepProps {
  email: string;
}

export function PasswordStep({ email }: PasswordStepProps) {
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) {
      toast.error("Please enter your password");
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          email,
          password 
        })
      });

      const data = await response.json();

      if (!response.ok) {
        throw new Error(data.error || 'Invalid credentials');
      }

      // Store tokens
      localStorage.setItem('access_token', data.access_token);
      localStorage.setItem('id_token', data.id_token);

      // Store user data if needed
      if (data.user) {
        localStorage.setItem('user', JSON.stringify(data.user));
      }

      // Redirect to dashboard
      router.push('/dashboard');
      
    } catch (error) {
      console.error("Login error:", error);
      toast.error("Invalid email or password");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-md mx-auto p-6">
      <h1 className="text-2xl font-semibold text-center mb-2">Welcome back</h1>
      <p className="text-center text-gray-600 mb-6">{email}</p>
      
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="space-y-2">
          <div className="relative">
            <Input
              type={showPassword ? "text" : "password"}
              placeholder="Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              className="w-full pr-10"
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-700"
            >
              {showPassword ? (
                <Icons.eyeOff className="h-4 w-4" />
              ) : (
                <Icons.eye className="h-4 w-4" />
              )}
            </button>
          </div>
        </div>

        <div className="flex justify-end">
          <Link 
            href={`/forgot-password?email=${encodeURIComponent(email)}`}
            className="text-sm text-green-600 hover:text-green-700"
          >
            Forgot password?
          </Link>
        </div>

        <Button 
          type="submit" 
          className="w-full bg-green-600 hover:bg-green-700" 
          size="lg"
          disabled={loading}
        >
          {loading ? (
            <Icons.spinner className="mr-2 h-4 w-4 animate-spin" />
          ) : (
            "Log in"
          )}
        </Button>
      </form>

      <div className="mt-4 text-center">
        <Link 
          href="/login"
          className="text-sm text-green-600 hover:text-green-700"
        >
          Not you?
        </Link>
      </div>
    </div>
  );
} 