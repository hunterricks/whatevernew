"use client";

import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { useRouter } from "next/navigation";
import { toast } from "sonner";
import { homeownerFormSchema, type HomeownerFormData } from "./schema";
import { BasicInfoStep } from "./components/BasicInfoStep";
import { AddressStep } from "./components/AddressStep";
import { PreferencesStep } from "./components/PreferencesStep";
import { InitialProjectStep } from "./components/InitialProjectStep";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { Button } from "@/components/ui/button";

const STEPS = [
  { id: 1, title: "Basic Information", component: BasicInfoStep },
  { id: 2, title: "Address", component: AddressStep },
  { id: 3, title: "Service Preferences", component: PreferencesStep },
  { id: 4, title: "Initial Project", component: InitialProjectStep },
];

export default function HomeownerRegistration() {
  const [step, setStep] = useState(1);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const router = useRouter();

  const form = useForm<HomeownerFormData>({
    resolver: zodResolver(homeownerFormSchema),
    defaultValues: {
      basicInfo: {
        firstName: "",
        lastName: "",
        email: "",
        password: "",
      },
      address: {
        street: "",
        city: "",
        state: "",
        zipCode: "",
      },
      preferences: {
        serviceTypes: [],
        budgetRange: "medium",
        serviceFrequency: "as_needed",
        preferredTimes: [],
      },
      initialProject: {
        projectType: "",
        description: "",
        timeline: "flexible",
        budget: 0,
      },
    },
  });

  const onSubmit = async (data: HomeownerFormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch("/api/register/homeowner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.message || "Registration failed");
      }

      toast.success("Registration successful!");
      router.push("/homeowner/onboarding");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Registration failed");
    } finally {
      setIsSubmitting(false);
    }
  };

  const nextStep = async () => {
    const fields = getFieldsForStep(step);
    const isValid = await form.trigger(fields);
    
    if (isValid) {
      setStep(step + 1);
      window.scrollTo(0, 0);
    }
  };

  const prevStep = () => {
    setStep(step - 1);
    window.scrollTo(0, 0);
  };

  const getFieldsForStep = (currentStep: number): Array<keyof HomeownerFormData> => {
    switch (currentStep) {
      case 1:
        return ["basicInfo"];
      case 2:
        return ["address"];
      case 3:
        return ["preferences"];
      case 4:
        return ["initialProject"];
      default:
        return [];
    }
  };

  const CurrentStep = STEPS[step - 1].component;
  const progress = (step / STEPS.length) * 100;

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
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <CurrentStep form={form} />

              <div className="flex justify-between pt-6">
                {step > 1 && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={prevStep}
                  >
                    Previous
                  </Button>
                )}
                
                {step < STEPS.length ? (
                  <Button
                    type="button"
                    onClick={nextStep}
                  >
                    Continue
                  </Button>
                ) : (
                  <Button
                    type="submit"
                    disabled={isSubmitting}
                  >
                    {isSubmitting ? "Creating Account..." : "Complete Registration"}
                  </Button>
                )}
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}