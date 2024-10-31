import * as z from "zod";

export const homeownerFormSchema = z.object({
  // Step 1: Basic Information
  basicInfo: z.object({
    firstName: z.string().min(2, "First name must be at least 2 characters"),
    lastName: z.string().min(2, "Last name must be at least 2 characters"),
    email: z.string().email("Please enter a valid email address"),
    password: z.string()
      .min(8, "Password must be at least 8 characters")
      .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
      .regex(/[a-z]/, "Password must contain at least one lowercase letter")
      .regex(/[0-9]/, "Password must contain at least one number"),
  }),

  // Step 2: Address
  address: z.object({
    street: z.string().min(5, "Street address is required"),
    city: z.string().min(2, "City is required"),
    state: z.string().length(2, "Please select a state"),
    zipCode: z.string().regex(/^\d{5}(-\d{4})?$/, "Enter a valid ZIP code"),
  }),

  // Step 3: Service Preferences
  preferences: z.object({
    serviceTypes: z.array(z.string()).min(1, "Select at least one service type"),
    budgetRange: z.enum(["low", "medium", "high"]),
    serviceFrequency: z.enum(["one_time", "recurring", "as_needed"]),
    preferredTimes: z.array(z.string()).min(1, "Select preferred service times"),
  }),

  // Step 4: Initial Project
  initialProject: z.object({
    projectType: z.string().min(1, "Select a project type"),
    description: z.string().min(20, "Please provide more details about your project"),
    timeline: z.enum(["immediate", "within_week", "within_month", "flexible"]),
    budget: z.number().min(1, "Please provide an estimated budget"),
  }),
});

export type HomeownerFormData = z.infer<typeof homeownerFormSchema>;

export const serviceTypes = [
  { id: "plumbing", label: "Plumbing" },
  { id: "electrical", label: "Electrical" },
  { id: "hvac", label: "HVAC" },
  { id: "carpentry", label: "Carpentry" },
  { id: "painting", label: "Painting" },
  { id: "landscaping", label: "Landscaping" },
  { id: "cleaning", label: "Cleaning" },
  { id: "renovation", label: "Renovation" },
] as const;

export const timePreferences = [
  { id: "morning", label: "Morning (8am-12pm)" },
  { id: "afternoon", label: "Afternoon (12pm-5pm)" },
  { id: "evening", label: "Evening (5pm-8pm)" },
  { id: "weekend", label: "Weekends" },
] as const;

export const states = [
  { value: "AL", label: "Alabama" },
  { value: "AK", label: "Alaska" },
  // ... add all states
  { value: "WY", label: "Wyoming" },
] as const;