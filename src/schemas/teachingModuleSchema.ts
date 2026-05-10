import { z } from 'zod';

export const teachingModuleSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(500, 'Title must be less than 500 characters'),
  description: z.string().trim().max(2000, 'Description must be less than 2000 characters').optional().or(z.literal('')),
  display_order: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
});

export type TeachingModuleFormData = z.infer<typeof teachingModuleSchema>;
