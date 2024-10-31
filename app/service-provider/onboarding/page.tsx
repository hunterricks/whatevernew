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
import { Checkbox } from "@/components/ui/checkbox";
import { ImageUpload } from "@/components/ui/image-upload";

const formSchema = z.object({
  businessDetails: z.object({
    licenseNumber: z.string().optional(),
    insuranceInfo: z.string().min(1, "Insurance information is required"),
    serviceArea: z.string().min(1, "Service area is required"),
    businessStructure: z.enum(["sole_proprietor", "llc", "corporation"]),
  }),
  services: z.object({
    primaryServices: z.array(z.string()).min(1, "Select at least one primary service"),
    hourlyRate: z.string().min(1, "Hourly rate is required"),
    minimumJobSize: z.string().min(1, "Minimum job size is required"),
    availability: z.enum(["full_time", "part_time", "weekends"]),
  }),
  profile: z.object({
    bio: z.string().min(50, "Bio should be at least 50 characters"),
    yearsInBusiness: z.string().min(1, "Years in business is required"),
    certifications: z.array(z.string()).optional(),
    portfolio: z.object({
      items: z.array(z.object({
        title: z.string().min(1, "Title is required"),
        description: z.string().min(1, "Description is required"),
        imageUrl: z.string().min(1, "Image is required"),
        serviceId: z.string().min(1, "Service type is required")
      })).min(1, "Add at least one portfolio item")
    })
  }),
});

type FormData = z.infer<typeof formSchema>;

export default function ServiceProviderOnboarding() {
  const [step, setStep] = useState(1);
  const router = useRouter();
  const { user, checkAuth } = useAuth();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<FormData>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      businessDetails: {
        licenseNumber: "",
        insuranceInfo: "",
        serviceArea: "",
        businessStructure: "sole_proprietor",
      },
      services: {
        primaryServices: [],
        hourlyRate: "",
        minimumJobSize: "",
        availability: "full_time",
      },
      profile: {
        bio: "",
        yearsInBusiness: "",
        certifications: [],
        portfolio: {
          items: []
        }
      },
    },
  });

  const onSubmit = async (data: FormData) => {
    setIsSubmitting(true);
    try {
      const response = await fetch('/api/service-provider/onboarding', {
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
      router.push('/dashboard/service-provider');
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
        return ["businessDetails.licenseNumber", "businessDetails.insuranceInfo", "businessDetails.serviceArea", "businessDetails.businessStructure"];
      case 2:
        return ["services.primaryServices", "services.hourlyRate", "services.minimumJobSize", "services.availability"];
      case 3:
        return ["profile.bio", "profile.yearsInBusiness", "profile.certifications"];
      case 4:
        return ["profile.portfolio.items"];
      default:
        return [];
    }
  };

  const services = [
    { id: "general", label: "General Contracting" },
    { id: "plumbing", label: "Plumbing" },
    { id: "electrical", label: "Electrical" },
    { id: "hvac", label: "HVAC" },
    { id: "carpentry", label: "Carpentry" },
    { id: "painting", label: "Painting" },
    { id: "landscaping", label: "Landscaping" },
  ];

  return (
    <div className="min-h-screen bg-background py-8 px-4">
      <div className="max-w-2xl mx-auto space-y-8">
        {/* Progress indicator */}
        <div className="space-y-2">
          <Progress value={(step / 4) * 100} className="h-2" />
          <div className="text-sm text-muted-foreground">
            Step {step} of 4
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>
              {step === 1 && "Business Information"}
              {step === 2 && "Services & Availability"}
              {step === 3 && "Professional Profile"}
              {step === 4 && "Portfolio"}
            </CardTitle>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                {step === 1 && (
                  <div className="space-y-4">
                    <FormField
                      control={form.control}
                      name="businessDetails.licenseNumber"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>License Number (if applicable)</FormLabel>
                          <FormControl>
                            <Input placeholder="Enter license number" {...field} />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessDetails.insuranceInfo"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Insurance Information</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Describe your insurance coverage"
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessDetails.serviceArea"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Service Area</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="e.g., 25 mile radius from ZIP 12345"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="businessDetails.businessStructure"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Business Structure</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid gap-4"
                            >
                              {[
                                {
                                  value: "sole_proprietor",
                                  label: "Sole Proprietorship",
                                  description: "Individual ownership"
                                },
                                {
                                  value: "llc",
                                  label: "Limited Liability Company (LLC)",
                                  description: "Protected business entity"
                                },
                                {
                                  value: "corporation",
                                  label: "Corporation",
                                  description: "Incorporated business"
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

                {step === 2 && (
                  <div className="space-y-6">
                    <FormField
                      control={form.control}
                      name="services.primaryServices"
                      render={() => (
                        <FormItem>
                          <FormLabel>Primary Services</FormLabel>
                          <div className="grid grid-cols-2 gap-4">
                            {services.map((service) => (
                              <FormField
                                key={service.id}
                                control={form.control}
                                name="services.primaryServices"
                                render={({ field }) => {
                                  return (
                                    <FormItem
                                      key={service.id}
                                      className="flex flex-row items-start space-x-3 space-y-0"
                                    >
                                      <FormControl>
                                        <Checkbox
                                          checked={field.value?.includes(service.id)}
                                          onCheckedChange={(checked) => {
                                            return checked
                                              ? field.onChange([...field.value, service.id])
                                              : field.onChange(
                                                  field.value?.filter(
                                                    (value) => value !== service.id
                                                  )
                                                )
                                          }}
                                        />
                                      </FormControl>
                                      <FormLabel className="font-normal">
                                        {service.label}
                                      </FormLabel>
                                    </FormItem>
                                  )
                                }}
                              />
                            ))}
                          </div>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="services.hourlyRate"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Hourly Rate ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="e.g., 75"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="services.minimumJobSize"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Minimum Job Size ($)</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="e.g., 500"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="services.availability"
                      render={({ field }) => (
                        <FormItem className="space-y-3">
                          <FormLabel>Availability</FormLabel>
                          <FormControl>
                            <RadioGroup
                              onValueChange={field.onChange}
                              defaultValue={field.value}
                              className="grid gap-4"
                            >
                              {[
                                {
                                  value: "full_time",
                                  label: "Full Time",
                                  description: "40+ hours per week"
                                },
                                {
                                  value: "part_time",
                                  label: "Part Time",
                                  description: "Less than 40 hours per week"
                                },
                                {
                                  value: "weekends",
                                  label: "Weekends Only",
                                  description: "Available on weekends"
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
                      name="profile.bio"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Professional Bio</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="Tell potential clients about your experience and expertise..."
                              className="min-h-[150px]"
                              {...field}
                            />
                          </FormControl>
                          <FormDescription>
                            Minimum 50 characters
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profile.yearsInBusiness"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Years in Business</FormLabel>
                          <FormControl>
                            <Input 
                              type="number"
                              placeholder="e.g., 5"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <FormField
                      control={form.control}
                      name="profile.certifications"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Certifications (Optional)</FormLabel>
                          <FormControl>
                            <Textarea 
                              placeholder="List any relevant certifications..."
                              className="min-h-[100px]"
                              {...field}
                            />
                          </FormControl>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                )}

                {step === 4 && (
                  <div className="space-y-6">
                    <div>
                      <FormLabel>Portfolio Items</FormLabel>
                      <FormDescription>
                        Add examples of your past work to showcase your skills
                      </FormDescription>
                      <div className="space-y-4 mt-4">
                        {form.watch('profile.portfolio.items').map((_, index) => (
                          <Card key={index}>
                            <CardContent className="space-y-4 pt-4">
                              <FormField
                                control={form.control}
                                name={`profile.portfolio.items.${index}.title`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Title</FormLabel>
                                    <FormControl>
                                      <Input {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`profile.portfolio.items.${index}.description`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Description</FormLabel>
                                    <FormControl>
                                      <Textarea {...field} />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <FormField
                                control={form.control}
                                name={`profile.portfolio.items.${index}.imageUrl`}
                                render={({ field }) => (
                                  <FormItem>
                                    <FormLabel>Project Image</FormLabel>
                                    <FormControl>
                                      <ImageUpload
                                        value={field.value}
                                        onChange={field.onChange}
                                        disabled={isSubmitting}
                                      />
                                    </FormControl>
                                    <FormMessage />
                                  </FormItem>
                                )}
                              />

                              <Button
                                type="button"
                                variant="destructive"
                                onClick={() => {
                                  const items = form.getValues('profile.portfolio.items');
                                  items.splice(index, 1);
                                  form.setValue('profile.portfolio.items', [...items]);
                                }}
                              >
                                Remove Item
                              </Button>
                            </CardContent>
                          </Card>
                        ))}

                        <Button
                          type="button"
                          variant="outline"
                          onClick={() => {
                            const items = form.getValues('profile.portfolio.items');
                            form.setValue('profile.portfolio.items', [
                              ...items,
                              {
                                title: '',
                                description: '',
                                imageUrl: '',
                                serviceId: ''
                              }
                            ]);
                          }}
                        >
                          Add Portfolio Item
                        </Button>
                      </div>
                    </div>
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
                  
                  {step < 4 ? (
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