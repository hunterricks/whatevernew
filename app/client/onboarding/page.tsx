"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/lib/auth";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Label } from "@/components/ui/label";
import { Progress } from "@/components/ui/progress";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

const formSchema = z.object({
  address: z.string().min(1, "Address is required"),
  phone: z.string().min(1, "Phone number is required"),
  preferences: z.object({
    projectSize: z.enum(["small", "medium", "large"]),
    projectFrequency: z.enum(["one-time", "occasional", "regular"]),
    budget: z.enum(["low", "medium", "high"]),
    communication: z.enum(["email", "phone", "both"])
  })
});

type FormData = z.infer<typeof formSchema>;

export default function ClientOnboarding() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { user, checkAuth } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      address: "",
      phone: "",
      preferences: {
        projectSize: "medium",
        projectFrequency: "occasional",
        budget: "medium",
        communication: "both"
      }
    }
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/client/onboarding', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userId: user?.id,
          ...data
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to save onboarding information');
      }

      toast.success("Profile setup complete!");
      router.push('/dashboard/client');
    } catch (error) {
      toast.error("Failed to complete setup");
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

  const getFieldsForStep = (currentStep: number) => {
    switch (currentStep) {
      case 1:
        return ["address", "phone"];
      case 2:
        return ["preferences.projectSize", "preferences.projectFrequency"];
      case 3:
        return ["preferences.budget", "preferences.communication"];
      default:
        return [];
    }
  };

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Progress indicator */}
        <div className="space-y-2">
          <Progress value={(step / 3) * 100} className="h-2" />
          <div className="text-sm text-muted-foreground">
            Step {step} of 3
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Contact Information"}
              {step === 2 && "Project Preferences"}
              {step === 3 && "Budget & Communication"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="address"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Address</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Enter your address"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="phone"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phone Number</FormLabel>
                          <FormControl>
                            <Input 
                              type="tel"
                              placeholder="Enter your phone number"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 2 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="preferences.projectSize"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Typical Project Size</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid gap-4"
                            >
                              {[
                                {
                                  value: "small",
                                  label: "Small Projects",
                                  description: "Quick fixes and minor improvements (Under $1,000)"
                                },
                                {
                                  value: "medium",
                                  label: "Medium Projects",
                                  description: "Moderate renovations ($1,000 - $10,000)"
                                },
                                {
                                  value: "large",
                                  label: "Large Projects",
                                  description: "Major renovations ($10,000+)"
                                }
                              ].map((option) => (
                                <Label
                                  key={option.value}
                                  className={cn(
                                    "flex flex-col items-start rounded-lg border p-4 cursor-pointer hover:border-primary",
                                    field.value === option.value && "border-primary bg-primary/5"
                                  )}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div>
                                      <p className="font-medium">{option.label}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {option.description}
                                      </p>
                                    </div>
                                    <RadioGroupItem value={option.value} />
                                  </div>
                                </Label>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferences.projectFrequency"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>How often do you need service providers?</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid gap-4"
                            >
                              {[
                                {
                                  value: "one-time",
                                  label: "One-time Project",
                                  description: "Just need help with a single project"
                                },
                                {
                                  value: "occasional",
                                  label: "Occasional Projects",
                                  description: "A few projects per year"
                                },
                                {
                                  value: "regular",
                                  label: "Regular Projects",
                                  description: "Ongoing needs throughout the year"
                                }
                              ].map((option) => (
                                <Label
                                  key={option.value}
                                  className={cn(
                                    "flex flex-col items-start rounded-lg border p-4 cursor-pointer hover:border-primary",
                                    field.value === option.value && "border-primary bg-primary/5"
                                  )}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div>
                                      <p className="font-medium">{option.label}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {option.description}
                                      </p>
                                    </div>
                                    <RadioGroupItem value={option.value} />
                                  </div>
                                </Label>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 3 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="preferences.budget"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Typical Project Budget</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid gap-4"
                            >
                              {[
                                {
                                  value: "low",
                                  label: "Budget-Conscious",
                                  description: "Looking for cost-effective solutions"
                                },
                                {
                                  value: "medium",
                                  label: "Mid-Range",
                                  description: "Balance of quality and cost"
                                },
                                {
                                  value: "high",
                                  label: "Premium",
                                  description: "Focus on quality, willing to invest more"
                                }
                              ].map((option) => (
                                <Label
                                  key={option.value}
                                  className={cn(
                                    "flex flex-col items-start rounded-lg border p-4 cursor-pointer hover:border-primary",
                                    field.value === option.value && "border-primary bg-primary/5"
                                  )}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div>
                                      <p className="font-medium">{option.label}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {option.description}
                                      </p>
                                    </div>
                                    <RadioGroupItem value={option.value} />
                                  </div>
                                </Label>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="preferences.communication"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Preferred Communication Method</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid gap-4"
                            >
                              {[
                                {
                                  value: "email",
                                  label: "Email Only",
                                  description: "Prefer written communication"
                                },
                                {
                                  value: "phone",
                                  label: "Phone Only",
                                  description: "Prefer voice communication"
                                },
                                {
                                  value: "both",
                                  label: "Both Email & Phone",
                                  description: "Flexible with communication methods"
                                }
                              ].map((option) => (
                                <Label
                                  key={option.value}
                                  className={cn(
                                    "flex flex-col items-start rounded-lg border p-4 cursor-pointer hover:border-primary",
                                    field.value === option.value && "border-primary bg-primary/5"
                                  )}
                                >
                                  <div className="flex items-center justify-between w-full">
                                    <div>
                                      <p className="font-medium">{option.label}</p>
                                      <p className="text-sm text-muted-foreground">
                                        {option.description}
                                      </p>
                                    </div>
                                    <RadioGroupItem value={option.value} />
                                  </div>
                                </Label>
                              ))}
                            </RadioGroup>
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                <div className="flex justify-between pt-6">
                  {step > 1 && (
                    <Button
                      type="button"
                      variant="outline"
                      onClick={() => setStep(step - 1)}
                    >
                      Previous
                    </Button>
                  )}
                  
                  {step < 3 ? (
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
                      {isSubmitting ? "Completing Setup..." : "Complete Setup"}
                    </Button>
                  )}
                </div>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}