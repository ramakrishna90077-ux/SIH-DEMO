import { z } from 'zod';

export const createNoteSchema = z.object({
  title: z.string().min(2, 'Title must be at least 2 characters'),
  description: z.string().optional(),
  courseId: z.string().min(1, 'Course ID is required'),
  topic: z.string().optional(),
  tags: z.array(z.string()).optional(),
  fileUrl: z.string().url('Invalid URL').optional(),
});

export const updateNoteSchema = z.object({
  title: z.string().min(2).optional(),
  description: z.string().optional(),
  topic: z.string().optional(),
  tags: z.array(z.string()).optional(),
  fileUrl: z.string().url('Invalid URL').optional(),
});

export type CreateNoteInput = z.infer<typeof createNoteSchema>;
export type UpdateNoteInput = z.infer<typeof updateNoteSchema>;
