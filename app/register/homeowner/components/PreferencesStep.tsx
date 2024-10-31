"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { RadioGroup, RadioGroupItem } from "@/components/ui/radio-group";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { UseFormReturn } from "react-hook-form";
import type { HomeownerFormData } from "../schema";
import { serviceTypes, timePreferences } from "../schema";
import { cn } from "@/lib/utils";

interface PreferencesStepProps {
  form: UseFormReturn<HomeownerFormData>;
}

export function PreferencesStep({ form }: PreferencesStepProps) {
  return (
    <div className="space-y-8">
      <FormField
        control={form.control}
        name="preferences.serviceTypes"
        render={() => (
          <FormItem>
            <FormLabel>What services are you interested in?</FormLabel>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {serviceTypes.map((service) => (
                <FormField
                  key={service.id}
                  control={form.control}
                  name="preferences.serviceTypes"
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
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {service.label}
                        </FormLabel>
                      </FormItem>
                    );
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
        name="preferences.budgetRange"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>What's your typical budget range for home services?</FormLabel>
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
        name="preferences.serviceFrequency"
        render={({ field }) => (
          <FormItem className="space-y-3">
            <FormLabel>How often do you typically need home services?</FormLabel>
            <FormControl>
              <RadioGroup
                onValueChange={field.onChange}
                defaultValue={field.value}
                className="grid gap-4"
              >
                {[
                  {
                    value: "one_time",
                    label: "One-time Projects",
                    description: "Single projects as needed"
                  },
                  {
                    value: "recurring",
                    label: "Regular Service",
                    description: "Scheduled maintenance or recurring work"
                  },
                  {
                    value: "as_needed",
                    label: "As Needed",
                    description: "Mix of one-time and recurring services"
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
        name="preferences.preferredTimes"
        render={() => (
          <FormItem>
            <FormLabel>When do you prefer service providers to work?</FormLabel>
            <div className="grid grid-cols-2 gap-4 mt-2">
              {timePreferences.map((time) => (
                <FormField
                  key={time.id}
                  control={form.control}
                  name="preferences.preferredTimes"
                  render={({ field }) => {
                    return (
                      <FormItem
                        key={time.id}
                        className="flex flex-row items-start space-x-3 space-y-0"
                      >
                        <FormControl>
                          <Checkbox
                            checked={field.value?.includes(time.id)}
                            onCheckedChange={(checked) => {
                              return checked
                                ? field.onChange([...field.value, time.id])
                                : field.onChange(
                                    field.value?.filter(
                                      (value) => value !== time.id
                                    )
                                  );
                            }}
                          />
                        </FormControl>
                        <FormLabel className="font-normal">
                          {time.label}
                        </FormLabel>
                      </FormItem>
                    );
                  }}
                />
              ))}
            </div>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}