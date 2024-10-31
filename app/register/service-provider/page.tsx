"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useRouter } from 'next/navigation';
import { toast } from "sonner";
import Link from "next/link";
import { LoginButton } from "../../components/login-button";
import { ArrowLeft } from "lucide-react";

const formSchema = z.object({
  firstName: z.string().min(2),
  lastName: z.string().min(2),
  email: z.string().email(),
  password: z.string().min(8),
  country: z.string().min(1),
  emailUpdates: z.boolean().default(true),
  termsAccepted: z.boolean().refine((val) => val === true, {
    message: "You must accept the terms and conditions",
  }),
});

export default function ServiceProviderRegisterPage() {
  return (
    <div className="container max-w-md mx-auto space-y-4 p-4">
      <Link href="/register">
        <Button variant="ghost" size="sm" className="mb-4">
          <ArrowLeft className="h-4 w-4 mr-2" />
          Back
        </Button>
      </Link>

      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Create Pro Account</h1>
        <p className="text-muted-foreground">Find projects and grow your business</p>
      </div>
      
      <div className="space-y-3">
        <LoginButton 
          role="service_provider"
          provider="google"
          variant="outline"
          size="lg"
          className="w-full"
          label="Sign up with Google"
        />
        
        <LoginButton 
          role="service_provider"
          provider="apple"
          variant="outline"
          size="lg"
          className="w-full"
          label="Sign up with Apple"
        />
      </div>

      <div className="text-center text-sm text-muted-foreground">
        Already have an account?{' '}
        <Link href="/login" className="text-primary hover:underline">
          Log In
        </Link>
      </div>
    </div>
  );
}