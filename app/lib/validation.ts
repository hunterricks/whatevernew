import { z } from 'zod';

export const jobSchema = z.object({
  title: z.string().min(5, 'Title must be at least 5 characters'),
  description: z.string().min(20, 'Description must be at least 20 characters'),
  budget: z.number().min(1, 'Budget must be greater than 0'),
  // ... other validations
});

export const proposalSchema = z.object({
  price: z.number().min(1, 'Price must be greater than 0'),
  estimatedDuration: z.string().min(1, 'Duration is required'),
  // ... other validations
}); 