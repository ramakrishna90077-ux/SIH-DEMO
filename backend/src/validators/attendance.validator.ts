import { z } from 'zod';

export const startAttendanceSchema = z.object({
  courseId: z.string().min(1, 'Course ID is required'),
  durationMinutes: z.number().min(1).max(60).default(10),
});

export const markAttendanceSchema = z.object({
  sessionId: z.string().min(1, 'Session ID is required'),
  code: z.string().min(1, 'Attendance code is required'),
});

export type StartAttendanceInput = z.infer<typeof startAttendanceSchema>;
export type MarkAttendanceInput = z.infer<typeof markAttendanceSchema>;
