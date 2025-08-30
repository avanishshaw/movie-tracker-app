import { z } from 'zod';

export const registerSchema = z.object({
  name: z.string().min(3, 'Name must be at least 3 characters long'),
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const loginSchema = z.object({
  email: z.string().email('Invalid email address'),
  password: z.string().min(6, 'Password must be at least 6 characters long'),
});

export const mediaEntrySchema = z.object({
  title: z.string().trim().min(1, 'Title is required'),
  type: z.enum(['Movie', 'TV Show']),
  director: z.string().trim().min(1, 'Director is required'),
  budget: z.number().positive('Budget must be a positive number'),
  location: z.string().trim().min(1, 'Location is required'),
  duration: z.string().trim().min(1, 'Duration is required'),
  releaseYear: z.number().int().min(1888, 'Invalid year'),
  posterUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
  thumbnailUrl: z.string().url('Must be a valid URL').optional().or(z.literal('')),
});

export const updateMediaEntrySchema = mediaEntrySchema.partial();