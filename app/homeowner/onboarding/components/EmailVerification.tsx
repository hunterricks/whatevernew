"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Mail, AlertCircle } from "lucide-react";

interface EmailVerificationProps {
  onComplete: () => void;
  isLoading: boolean;
  setIsLoading: (loading: boolean) => void;
}

export function EmailVerification({ 
  onComplete, 
  isLoading, 
  setIsLoading 
}: EmailVerificationProps) {
  const [verificationCode, setVerificationCode] = useState("");

  const handleResendCode = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/resend-verification", {
        method: "POST",
      });

      if (!response.ok) throw new Error("Failed to resend code");
      toast.success("Verification code sent!");
    } catch (error) {
      toast.error("Failed to resend verification code");
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerify = async () => {
    setIsLoading(true);
    try {
      const response = await fetch("/api/auth/verify-email", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: verificationCode }),
      });

      if (!response.ok) throw new Error("Invalid verification code");

      toast.success("Email verified successfully!");
      onComplete();
    } catch (error) {
      toast.error("Invalid verification code");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <Alert>
        <AlertCircle className="h-4 w-4" />
        <AlertDescription>
          We've sent a verification code to your email address. Please check your inbox and enter the code below.
        </AlertDescription>
      </Alert>

      <div className="space-y-4">
        <div className="space-y-2">
          <Input
            placeholder="Enter verification code"
            value={verificationCode}
            onChange={(e) => setVerificationCode(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-2">
          <Button 
            onClick={handleVerify} 
            disabled={!verificationCode || isLoading}
          >
            {isLoading ? "Verifying..." : "Verify Email"}
          </Button>
          
          <Button
            variant="outline"
            onClick={handleResendCode}
            disabled={isLoading}
          >
            <Mail className="mr-2 h-4 w-4" />
            Resend Code
          </Button>
        </div>
      </div>
    </div>
  );
}