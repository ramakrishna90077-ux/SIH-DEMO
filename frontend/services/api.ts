import { api } from './api';
import type { User, AuthResponse, ApiResponse, Course, AttendanceSession, Attendance, Note } from '@/types';

export const authService = {
  async register(name: string, email: string, password: string, role: 'student' | 'teacher', rollNumber?: string) {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', {
      name,
      email,
      password,
      role,
      rollNumber,
    });
    return response.data;
  },

  async login(email: string, password: string) {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', {
      email,
      password,
    });
    return response.data;
  },

  async logout() {
    const response = await api.post<ApiResponse<void>>('/auth/logout');
    return response.data;
  },

  async getMe() {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },

  // Store auth data
  setAuth(token: string, user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  },

  // Clear auth data
  clearAuth() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },

  // Get current user
  getCurrentUser(): User | null {
    if (typeof window !== 'undefined') {
      const userStr = localStorage.getItem('user');
      if (userStr) {
        try {
          return JSON.parse(userStr);
        } catch {
          return null;
        }
      }
    }
    return null;
  },

  // Get token
  getToken(): string | null {
    if (typeof window !== 'undefined') {
      return localStorage.getItem('token');
    }
    return null;
  },

  // Check if authenticated
  isAuthenticated(): boolean {
    return !!this.getToken();
  },
};

export const courseService = {
  async getCourses() {
    const response = await api.get<ApiResponse<Course[]>>('/courses');
    return response.data;
  },

  async getCourse(id: string) {
    const response = await api.get<ApiResponse<Course>>(`/courses/${id}`);
    return response.data;
  },

  async createCourse(data: { name: string; code: string; description: string }) {
    const response = await api.post<ApiResponse<Course>>('/courses', data);
    return response.data;
  },

  async updateCourse(id: string, data: Partial<typeof data>) {
    const response = await api.put<ApiResponse<Course>>(`/courses/${id}`, data);
    return response.data;
  },

  async deleteCourse(id: string) {
    const response = await api.delete<ApiResponse<void>>(`/courses/${id}`);
    return response.data;
  },

  async joinCourse(code: string) {
    const response = await api.post<ApiResponse<Course>>('/courses/join', { code });
    return response.data;
  },

  async getStudents(courseId: string) {
    const response = await api.get<ApiResponse<User[]>>(`/courses/${courseId}/students`);
    return response.data;
  },
};

export const attendanceService = {
  async startSession(courseId: string, durationMinutes: number = 10) {
    const response = await api.post<ApiResponse<AttendanceSession>>('/attendance/sessions', {
      courseId,
      durationMinutes,
    });
    return response.data;
  },

  async getSession(id: string) {
    const response = await api.get<ApiResponse<AttendanceSession>>(`/attendance/sessions/${id}`);
    return response.data;
  },

  async markAttendance(sessionId: string, code: string) {
    const response = await api.post<ApiResponse<Attendance>>('/attendance/mark', {
      sessionId,
      code,
    });
    return response.data;
  },

  async closeSession(sessionId: string) {
    const response = await api.post<ApiResponse<AttendanceSession>>(`/attendance/sessions/${sessionId}/close`);
    return response.data;
  },

  async getCourseAttendance(courseId: string) {
    const response = await api.get<ApiResponse<AttendanceSession[]>>(`/attendance/course/${courseId}`);
    return response.data;
  },

  async getStudentAttendance(studentId?: string) {
    const url = studentId ? `/attendance/student/${studentId}` : '/attendance/student/me';
    const response = await api.get<ApiResponse<Attendance[]>>(url);
    return response.data;
  },

  async getSessionStudents(sessionId: string) {
    const response = await api.get<ApiResponse<User[]>>(`/attendance/sessions/${sessionId}/students`);
    return response.data;
  },
};

export const noteService = {
  async getNotes(params?: { courseId?: string; search?: string; topic?: string; page?: number; limit?: number }) {
    const response = await api.get<ApiResponse<Note[]>>('/notes', { params });
    return response.data;
  },

  async getNote(id: string) {
    const response = await api.get<ApiResponse<Note>>(`/notes/${id}`);
    return response.data;
  },

  async createNote(data: {
    courseId: string;
    title: string;
    description: string;
    topic: string;
    tags: string[];
    fileUrl?: string;
  }) {
    const response = await api.post<ApiResponse<Note>>('/notes', data);
    return response.data;
  },

  async updateNote(id: string, data: Partial<typeof data>) {
    const response = await api.put<ApiResponse<Note>>(`/notes/${id}`, data);
    return response.data;
  },

  async deleteNote(id: string) {
    const response = await api.delete<ApiResponse<void>>(`/notes/${id}`);
    return response.data;
  },
};
