import { api } from '@/lib/api';
import type { User, AuthResponse, ApiResponse, Course, AttendanceSession, Attendance, Note } from '@/types';

export const authService = {
  async register(name: string, email: string, password: string, role: 'student' | 'teacher', rollNumber?: string) {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/register', { name, email, password, role, rollNumber });
    return response.data;
  },
  async login(email: string, password: string) {
    const response = await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password });
    return response.data;
  },
  async logout() {
    // JWT authentication is stateless; revoke the client session locally.
    this.clearAuth();
  },
  async getMe() {
    const response = await api.get<ApiResponse<User>>('/auth/me');
    return response.data;
  },
  setAuth(token: string, user: User) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('user', JSON.stringify(user));
    }
  },
  clearAuth() {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
    }
  },
  getCurrentUser(): User | null {
    if (typeof window === 'undefined') return null;
    const value = localStorage.getItem('user');
    if (!value) return null;
    try { return JSON.parse(value) as User; } catch { return null; }
  },
  getToken(): string | null {
    return typeof window === 'undefined' ? null : localStorage.getItem('token');
  },
  isAuthenticated(): boolean { return Boolean(this.getToken()); },
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
  async createCourse(data: { name: string; code: string; description?: string }) {
    const response = await api.post<ApiResponse<Course>>('/courses', data);
    return response.data;
  },
  async updateCourse(id: string, data: { name?: string; code?: string; description?: string }) {
    const response = await api.put<ApiResponse<Course>>(`/courses/${id}`, data);
    return response.data;
  },
  async deleteCourse(id: string) {
    await api.delete(`/courses/${id}`);
  },
  async joinCourse(courseCode: string) {
    const response = await api.post<ApiResponse<Course>>('/courses/join', { courseCode });
    return response.data;
  },
  async getStudents(courseId: string) {
    const response = await api.get<ApiResponse<User[]>>(`/courses/${courseId}/students`);
    return response.data;
  },
};

export const attendanceService = {
  async startSession(courseId: string, durationMinutes = 10) {
    const response = await api.post<ApiResponse<AttendanceSession>>('/attendance/sessions', { courseId, durationMinutes });
    return response.data;
  },
  async getSession(id: string) {
    const response = await api.get<ApiResponse<unknown>>(`/attendance/sessions/${id}/stats`);
    return response.data;
  },
  async markAttendance(sessionId: string, code: string) {
    const response = await api.post<ApiResponse<Attendance>>('/attendance/mark', { sessionId, code });
    return response.data;
  },
  async closeSession(sessionId: string) {
    const response = await api.post<ApiResponse<AttendanceSession>>(`/attendance/sessions/${sessionId}/close`);
    return response.data;
  },
  async getCourseAttendance(courseId: string) {
    const response = await api.get<ApiResponse<AttendanceSession[]>>(`/attendance/course/${courseId}/sessions`);
    return response.data;
  },
  async getStudentAttendance(courseId?: string) {
    const response = await api.get<ApiResponse<Attendance[]>>('/attendance/student/my', { params: courseId ? { courseId } : undefined });
    return response.data;
  },
  async getSessionStudents(sessionId: string) {
    const response = await api.get<ApiResponse<unknown>>(`/attendance/sessions/${sessionId}/stats`);
    return response.data;
  },
  async getCourseAnalytics(courseId: string) {
    const response = await api.get<ApiResponse<unknown>>(`/attendance/course/${courseId}/analytics`);
    return response.data;
  },
};

export const noteService = {
  async getNotes(params?: { courseId?: string; search?: string; topic?: string; page?: number; limit?: number }) {
    const response = await api.get<ApiResponse<{ notes: Note[]; pagination?: unknown }>>('/notes', { params });
    return response.data;
  },
  async getNote(id: string) {
    const response = await api.get<ApiResponse<Note>>(`/notes/${id}`);
    return response.data;
  },
  async createNote(data: { courseId: string; title: string; description?: string; topic?: string; tags?: string[]; fileUrl?: string }) {
    const response = await api.post<ApiResponse<Note>>('/notes', data);
    return response.data;
  },
  async updateNote(id: string, data: { title?: string; description?: string; topic?: string; tags?: string[]; fileUrl?: string }) {
    const response = await api.put<ApiResponse<Note>>(`/notes/${id}`, data);
    return response.data;
  },
  async deleteNote(id: string) { await api.delete(`/notes/${id}`); },
};
