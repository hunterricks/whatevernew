"use client";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UseFormReturn } from "react-hook-form";
import type { HomeownerFormData } from "../schema";
import { serviceTypes } from "../schema";

interface InitialProjectStepProps {
  form: UseFormReturn<HomeownerFormData>;
}

export function InitialProjectStep({ form }: InitialProjectStepProps) {
  return (
    <div className="space-y-6">
      <FormField
        control={form.control}
        name="initialProject.projectType"
        render={({ field }) => (
          <FormItem>
            <FormLabel>What type of project do you need help with?</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select a project type" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                {serviceTypes.map((type) => (
                  <SelectItem key={type.id} value={type.id}>
                    {type.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="initialProject.description"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Project Description</FormLabel>
            <FormControl>
              <Textarea 
                placeholder="Please describe your project in detail..."
                className="min-h-[120px]"
                {...field}
              />
            </FormControl>
            <FormDescription>
              Include specific details about what needs to be done, any special requirements, or concerns.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="initialProject.timeline"
        render={({ field }) => (
          <FormItem>
            <FormLabel>When do you need this done?</FormLabel>
            <Select onValueChange={field.onChange} defaultValue={field.value}>
              <FormControl>
                <SelectTrigger>
                  <SelectValue placeholder="Select timeline" />
                </SelectTrigger>
              </FormControl>
              <SelectContent>
                <SelectItem value="immediate">As soon as possible</SelectItem>
                <SelectItem value="within_week">Within a week</SelectItem>
                <SelectItem value="within_month">Within a month</SelectItem>
                <SelectItem value="flexible">Flexible / No rush</SelectItem>
              </SelectContent>
            </Select>
            <FormMessage />
          </FormItem>
        )}
      />

      <FormField
        control={form.control}
        name="initialProject.budget"
        render={({ field }) => (
          <FormItem>
            <FormLabel>Estimated Budget ($)</FormLabel>
            <FormControl>
              <Input 
                type="number"
                min="0"
                step="100"
                placeholder="e.g., 1000"
                {...field}
                onChange={(e) => field.onChange(Number(e.target.value))}
              />
            </FormControl>
            <FormDescription>
              Provide your estimated budget for this project. This helps match you with appropriate service providers.
            </FormDescription>
            <FormMessage />
          </FormItem>
        )}
      />
    </div>
  );
}