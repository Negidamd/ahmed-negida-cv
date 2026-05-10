import { z } from 'zod';

export const projectSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(200, 'Title must be less than 200 characters'),
  description: z.string().trim().max(2000, 'Description must be less than 2000 characters').optional().or(z.literal('')),
  status: z.string().trim().max(50, 'Status must be less than 50 characters').optional().or(z.literal('')),
  start_date: z.string().trim().max(50, 'Start date must be less than 50 characters').optional().or(z.literal('')),
  end_date: z.string().trim().max(50, 'End date must be less than 50 characters').optional().or(z.literal('')),
  institution: z.string().trim().max(200, 'Institution must be less than 200 characters').optional().or(z.literal('')),
  role: z.string().trim().max(100, 'Role must be less than 100 characters').optional().or(z.literal('')),
  funding: z.string().trim().max(500, 'Funding must be less than 500 characters').optional().or(z.literal('')),
  collaborators: z.string().trim().max(1000, 'Collaborators must be less than 1000 characters').optional().or(z.literal('')),
  outcomes: z.string().trim().max(2000, 'Outcomes must be less than 2000 characters').optional().or(z.literal('')),
  photo_url: z.string().trim().max(500, 'Photo URL must be less than 500 characters').optional().or(z.literal('')),
  display_order: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
});

export type ProjectFormData = z.infer<typeof projectSchema>;
