'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { attendanceService, courseService } from '@/services/api';
import type { Course, AttendanceSession, Attendance } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BookOpen, ClipboardList, CheckCircle, XCircle, AlertTriangle } from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [activeSessions, setActiveSessions] = useState<AttendanceSession[]>([]);

  useEffect(() => {
    if (!authLoading && !user) {
      router.push('/login');
      return;
    }

    if (user && user.role !== 'student') {
      router.push('/teacher/dashboard');
      return;
    }

    if (user) {
      loadData();
    }
  }, [user, authLoading]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, attendanceRes] = await Promise.all([
        courseService.getCourses(),
        attendanceService.getStudentAttendance(),
      ]);

      if (coursesRes.success && coursesRes.data) {
        setCourses(coursesRes.data);
      }

      if (attendanceRes.success && attendanceRes.data) {
        setAttendance(attendanceRes.data);
      }
    } catch (err: unknown) {
      if (err instanceof Error) {
        setError(err.message);
      } else {
        setError('Failed to load data');
      }
    } finally {
      setLoading(false);
    }
  };

  // Calculate attendance stats
  const getAttendanceStats = () => {
    const sessionIds = new Set(attendance.map((a) => a.sessionId));
    return {
      totalSessions: sessionIds.size,
      attended: attendance.length,
    };
  };

  const stats = getAttendanceStats();
  const percentage = stats.totalSessions > 0 ? Math.round((stats.attended / stats.totalSessions) * 100) : 0;
  const isLowAttendance = percentage < 75;

  if (authLoading || loading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <LoadingSpinner size="lg" />
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1>
        <p className="text-gray-600 mt-1">Welcome back, {user?.name}</p>
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-blue-100 rounded-lg flex items-center justify-center">
              <BookOpen className="h-6 w-6 text-blue-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Enrolled Courses</p>
              <p className="text-2xl font-bold text-gray-900">{courses.length}</p>
            </div>
          </div>
        </div>

        <div className="bg-white rounded-xl shadow-sm p-6 border">
          <div className="flex items-center">
            <div className="w-12 h-12 bg-green-100 rounded-lg flex items-center justify-center">
              <CheckCircle className="h-6 w-6 text-green-600" />
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Classes Attended</p>
              <p className="text-2xl font-bold text-gray-900">{stats.attended}</p>
            </div>
          </div>
        </div>

        <div className={`rounded-xl shadow-sm p-6 border ${isLowAttendance ? 'bg-red-50 border-red-200' : 'bg-white'}`}>
          <div className="flex items-center">
            <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${isLowAttendance ? 'bg-red-100' : 'bg-purple-100'}`}>
              {isLowAttendance ? (
                <AlertTriangle className="h-6 w-6 text-red-600" />
              ) : (
                <ClipboardList className="h-6 w-6 text-purple-600" />
              )}
            </div>
            <div className="ml-4">
              <p className="text-sm text-gray-600">Attendance Percentage</p>
              <p className={`text-2xl font-bold ${isLowAttendance ? 'text-red-600' : 'text-gray-900'}`}>
                {percentage}%
              </p>
            </div>
          </div>
          {isLowAttendance && (
            <p className="mt-2 text-sm text-red-600">
              ⚠️ Your attendance is below 75%. Please attend more classes.
            </p>
          )}
        </div>
      </div>

      {/* Enrolled Courses */}
      <div className="bg-white rounded-xl shadow-sm border mb-8">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">My Courses</h2>
        </div>
        <div className="p-6">
          {courses.length === 0 ? (
            <div className="text-center py-8">
              <BookOpen className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">You are not enrolled in any courses yet.</p>
              <p className="text-sm text-gray-500 mt-2">Use a course code to join a class.</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {courses.map((course) => (
                <div key={course._id} className="border rounded-lg p-4 hover:shadow-md transition-shadow">
                  <h3 className="font-semibold text-gray-900">{course.name}</h3>
                  <p className="text-sm text-gray-600 mt-1">{course.description}</p>
                  <div className="mt-3 flex items-center justify-between">
                    <span className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                      Code: {course.code}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Recent Attendance */}
      <div className="bg-white rounded-xl shadow-sm border">
        <div className="p-6 border-b">
          <h2 className="text-xl font-semibold text-gray-900">Recent Attendance</h2>
        </div>
        <div className="p-6">
          {attendance.length === 0 ? (
            <div className="text-center py-8">
              <ClipboardList className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <p className="text-gray-600">No attendance records yet.</p>
            </div>
          ) : (
            <div className="space-y-3">
              {attendance.slice(-10).reverse().map((record, index) => (
                <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                  <div>
                    <p className="font-medium text-gray-900">Class Session</p>
                    <p className="text-sm text-gray-600">
                      {new Date(record.markedAt).toLocaleDateString()} at{' '}
                      {new Date(record.markedAt).toLocaleTimeString()}
                    </p>
                  </div>
                  <CheckCircle className="h-6 w-6 text-green-600" />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
