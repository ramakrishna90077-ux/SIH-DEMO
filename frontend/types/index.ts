export interface User {
  _id: string;
  name: string;
  email: string;
  role: 'student' | 'teacher';
  rollNumber?: string;
}

export interface Course {
  _id: string;
  name: string;
  code: string;
  description: string;
  teacherId: string;
  students: string[];
  createdAt: string;
  updatedAt: string;
}

export interface AttendanceSession {
  _id: string;
  courseId: string;
  teacherId: string;
  code: string;
  startedAt: string;
  expiresAt: string;
  status: 'active' | 'closed' | 'expired';
  createdAt: string;
}

export interface Attendance {
  _id: string;
  sessionId: string;
  courseId: string;
  studentId: string;
  markedAt: string;
}

export interface Note {
  _id: string;
  courseId: string;
  teacherId: string;
  title: string;
  description: string;
  topic: string;
  tags: string[];
  fileUrl?: string;
  createdAt: string;
  updatedAt: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface ApiResponse<T> {
  success: boolean;
  message?: string;
  data?: T;
}
