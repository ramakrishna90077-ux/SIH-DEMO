import { api } from '@/lib/api';
import type { User, AuthResponse, ApiResponse, Course, AttendanceSession, Attendance, Note } from '@/types';

export const authService = {
  async register(name: string, email: string, password: string, role: 'student' | 'teacher', rollNumber?: string) {
    return (await api.post<ApiResponse<AuthResponse>>('/auth/register', { name, email, password, role, rollNumber })).data;
  },
  async login(email: string, password: string) { return (await api.post<ApiResponse<AuthResponse>>('/auth/login', { email, password })).data; },
  async logout() { if (typeof window !== 'undefined') this.clearAuth(); },
  async getMe() { return (await api.get<ApiResponse<User>>('/auth/me')).data; },
  setAuth(token: string, user: User) { if (typeof window !== 'undefined') { localStorage.setItem('token', token); localStorage.setItem('user', JSON.stringify(user)); } },
  clearAuth() { if (typeof window !== 'undefined') { localStorage.removeItem('token'); localStorage.removeItem('user'); } },
  getCurrentUser(): User | null { if (typeof window === 'undefined') return null; const value = localStorage.getItem('user'); if (!value) return null; try { return JSON.parse(value) as User; } catch { return null; } },
  getToken(): string | null { return typeof window === 'undefined' ? null : localStorage.getItem('token'); },
  isAuthenticated() { return Boolean(this.getToken()); },
};

export const courseService = {
  async getCourses() { return (await api.get<ApiResponse<Course[]>>('/courses')).data; },
  async getCourse(id: string) { return (await api.get<ApiResponse<Course>>(`/courses/${id}`)).data; },
  async createCourse(data: { name: string; code: string; description?: string }) { return (await api.post<ApiResponse<Course>>('/courses', data)).data; },
  async updateCourse(id: string, data: { name?: string; code?: string; description?: string }) { return (await api.put<ApiResponse<Course>>(`/courses/${id}`, data)).data; },
  async deleteCourse(id: string) { await api.delete(`/courses/${id}`); },
  async joinCourse(courseCode: string) { return (await api.post<ApiResponse<Course>>('/courses/join', { courseCode })).data; },
  async getStudents(courseId: string) { return (await api.get<ApiResponse<User[]>>(`/courses/${courseId}/students`)).data; },
};

export const attendanceService = {
  async startSession(courseId: string, durationMinutes = 10) { return (await api.post<ApiResponse<AttendanceSession>>('/attendance/sessions', { courseId, durationMinutes })).data; },
  async getSession(id: string) { return (await api.get<ApiResponse<unknown>>(`/attendance/sessions/${id}/stats`)).data; },
  async markAttendance(sessionId: string, code: string) { return (await api.post<ApiResponse<Attendance>>('/attendance/mark', { sessionId, code })).data; },
  async closeSession(sessionId: string) { return (await api.post<ApiResponse<AttendanceSession>>(`/attendance/sessions/${sessionId}/close`)).data; },
  async getCourseAttendance(courseId: string) { return (await api.get<ApiResponse<AttendanceSession[]>>(`/attendance/course/${courseId}/sessions`)).data; },
  async getStudentAttendance(courseId?: string) { return (await api.get<ApiResponse<Attendance[]>>('/attendance/student/my', { params: courseId ? { courseId } : undefined })).data; },
  async getStudentAnalytics() { return (await api.get<ApiResponse<{ totalSessions: number; attended: number; percentage: number }>>('/attendance/student/my/analytics')).data; },
  async getSessionStudents(sessionId: string) { return (await api.get<ApiResponse<unknown>>(`/attendance/sessions/${sessionId}/stats`)).data; },
  async getCourseAnalytics(courseId: string) { return (await api.get<ApiResponse<unknown>>(`/attendance/course/${courseId}/analytics`)).data; },
  async getActiveSession(courseId: string) { return (await api.get<ApiResponse<AttendanceSession | null>>(`/attendance/course/${courseId}/active`)).data; },
};

export const noteService = {
  async getNotes(params?: { courseId?: string; search?: string; topic?: string; page?: number; limit?: number }) { return (await api.get<ApiResponse<{ notes: Note[]; pagination?: unknown }>>('/notes', { params })).data; },
  async getNote(id: string) { return (await api.get<ApiResponse<Note>>(`/notes/${id}`)).data; },
  async createNote(data: { courseId: string; title: string; description?: string; topic?: string; tags?: string[]; fileUrl?: string }) { return (await api.post<ApiResponse<Note>>('/notes', data)).data; },
  async updateNote(id: string, data: { title?: string; description?: string; topic?: string; tags?: string[]; fileUrl?: string }) { return (await api.put<ApiResponse<Note>>(`/notes/${id}`, data)).data; },
  async deleteNote(id: string) { await api.delete(`/notes/${id}`); },
};
