import { z } from 'zod';

export const createCourseSchema = z.object({
  name: z.string().min(2, 'Course name must be at least 2 characters'),
  code: z.string().min(2, 'Course code must be at least 2 characters'),
  description: z.string().optional(),
});

export const joinCourseSchema = z.object({
  courseCode: z.string().min(1, 'Course code is required'),
});

export type CreateCourseInput = z.infer<typeof createCourseSchema>;
export type JoinCourseInput = z.infer<typeof joinCourseSchema>;
