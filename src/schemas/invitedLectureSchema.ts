import { z } from 'zod';

export const invitedLectureSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(500, 'Title must be less than 500 characters'),
  event: z.string().trim().max(300, 'Event must be less than 300 characters').optional().or(z.literal('')),
  location: z.string().trim().max(200, 'Location must be less than 200 characters').optional().or(z.literal('')),
  date: z.string().trim().max(50, 'Date must be less than 50 characters').optional().or(z.literal('')),
  description: z.string().trim().max(2000, 'Description must be less than 2000 characters').optional().or(z.literal('')),
  display_order: z.number().int().min(0).optional(),
  visible: z.boolean().optional(),
});

export type InvitedLectureFormData = z.infer<typeof invitedLectureSchema>;
