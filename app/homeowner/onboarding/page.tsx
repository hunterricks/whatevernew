"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { EmailVerification } from "./components/EmailVerification";
import { PaymentSetup } from "./components/PaymentSetup";
import { ProfileCompletion } from "./components/ProfileCompletion";
import { Alert, AlertDescription } from "@/components/ui/alert";

const STEPS = [
  { id: 1, title: "Verify Email", component: EmailVerification },
  { id: 2, title: "Complete Profile", component: ProfileCompletion },
  { id: 3, title: "Set Up Payment", component: PaymentSetup },
];

export default function HomeownerOnboarding() {
  const [step, setStep] = useState(1);
  const [isLoading, setIsLoading] = useState(false);
  const router = useRouter();
  const { user, checkAuth } = useAuth();

  useEffect(() => {
    if (!checkAuth()) {
      router.push('/login');
      return;
    }

    if (!user?.roles.includes('client')) {
      router.push('/dashboard');
      return;
    }
  }, [user, router, checkAuth]);

  const CurrentStep = STEPS[step - 1].component;
  const progress = (step / STEPS.length) * 100;

  const handleStepComplete = async () => {
    if (step < STEPS.length) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    } else {
      router.push('/dashboard/client');
    }
  };

  if (!user) return null;

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        <div className="space-y-2">
          <Progress value={progress} className="h-2" />
          <div className="text-sm text-muted-foreground">
            Step {step} of {STEPS.length}: {STEPS[step - 1].title}
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{STEPS[step - 1].title}</CardTitle>
          </CardHeader>
          <CardContent>
            <CurrentStep 
              onComplete={handleStepComplete}
              isLoading={isLoading}
              setIsLoading={setIsLoading}
            />
          </CardContent>
        </Card>
      </div>
    </div>
  );
}