import { z } from 'zod';

export const publicationSchema = z.object({
  title: z.string().trim().min(1, 'Title is required').max(500, 'Title must be less than 500 characters'),
  authors: z.string().trim().max(1000, 'Authors must be less than 1000 characters').optional().or(z.literal('')),
  journal: z.string().trim().max(200, 'Journal must be less than 200 characters').optional().or(z.literal('')),
  year: z.string().trim().regex(/^\d{4}$/, 'Year must be a valid 4-digit year').optional().or(z.literal('')),
  pmid: z.string().trim().max(20, 'PMID must be less than 20 characters').optional().or(z.literal('')),
  doi: z.string().trim().max(100, 'DOI must be less than 100 characters').optional().or(z.literal('')),
  abstract: z.string().trim().max(5000, 'Abstract must be less than 5000 characters').optional().or(z.literal('')),
  type: z.string().trim().max(100, 'Type must be less than 100 characters').optional().or(z.literal('')),
  impact: z.string().trim().max(100, 'Impact must be less than 100 characters').optional().or(z.literal('')),
  photo_url: z.string().trim().max(500, 'Photo URL must be less than 500 characters').optional().or(z.literal('')),
  display_order: z.number().int().min(0).optional(),
});

export type PublicationFormData = z.infer<typeof publicationSchema>;
