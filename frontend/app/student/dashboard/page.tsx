'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { attendanceService, courseService } from '@/services/api';
import type { Course, Attendance } from '@/types';
import LoadingSpinner from '@/components/LoadingSpinner';
import { BookOpen, ClipboardList, CheckCircle, AlertTriangle } from 'lucide-react';

export default function StudentDashboard() {
  const router = useRouter();
  const { user, loading: authLoading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [attendance, setAttendance] = useState<Attendance[]>([]);
  const [stats, setStats] = useState({ totalSessions: 0, attended: 0, percentage: 0 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!authLoading && !user) { router.replace('/login'); return; }
    if (user && user.role !== 'student') { router.replace('/teacher/dashboard'); return; }
    if (user) void loadData();
  }, [user, authLoading, router]);

  const loadData = async () => {
    try {
      setLoading(true);
      const [coursesRes, attendanceRes, analyticsRes] = await Promise.all([
        courseService.getCourses(), attendanceService.getStudentAttendance(), attendanceService.getStudentAnalytics(),
      ]);
      if (coursesRes.success && coursesRes.data) setCourses(coursesRes.data);
      if (attendanceRes.success && attendanceRes.data) setAttendance(attendanceRes.data);
      if (analyticsRes.success && analyticsRes.data) setStats(analyticsRes.data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to load dashboard');
    } finally { setLoading(false); }
  };

  if (authLoading || loading) return <div className="flex justify-center items-center min-h-screen"><LoadingSpinner size="lg" /></div>;
  const isLowAttendance = stats.totalSessions > 0 && stats.percentage < 75;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8"><h1 className="text-3xl font-bold text-gray-900">My Dashboard</h1><p className="text-gray-600 mt-1">Welcome back, {user?.name}</p></div>
      {error && <div className="mb-6 rounded-lg bg-red-50 border border-red-200 p-4 text-red-700">{error}</div>}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
        <div className="bg-white rounded-xl shadow-sm p-6 border"><div className="flex items-center"><BookOpen className="h-8 w-8 text-blue-600"/><div className="ml-4"><p className="text-sm text-gray-600">Enrolled Courses</p><p className="text-2xl font-bold">{courses.length}</p></div></div></div>
        <div className="bg-white rounded-xl shadow-sm p-6 border"><div className="flex items-center"><CheckCircle className="h-8 w-8 text-green-600"/><div className="ml-4"><p className="text-sm text-gray-600">Classes Attended</p><p className="text-2xl font-bold">{stats.attended}</p></div></div></div>
        <div className={`rounded-xl shadow-sm p-6 border ${isLowAttendance ? 'bg-red-50 border-red-200' : 'bg-white'}`}><div className="flex items-center"><AlertTriangle className={`h-8 w-8 ${isLowAttendance ? 'text-red-600' : 'text-purple-600'}`}/><div className="ml-4"><p className="text-sm text-gray-600">Attendance Percentage</p><p className={`text-2xl font-bold ${isLowAttendance ? 'text-red-600' : ''}`}>{stats.percentage}%</p></div></div>{isLowAttendance && <p className="mt-2 text-sm text-red-600">Your attendance is below 75%.</p>}</div>
      </div>
      <div className="bg-white rounded-xl shadow-sm border mb-8"><div className="p-6 border-b"><h2 className="text-xl font-semibold">My Courses</h2></div><div className="p-6">{courses.length === 0 ? <p className="text-gray-600">You are not enrolled in any courses yet.</p> : <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">{courses.map((course) => <div key={course._id} className="border rounded-lg p-4"><h3 className="font-semibold">{course.name}</h3><p className="text-sm text-gray-600 mt-1">{course.description}</p><span className="inline-block mt-3 text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">Code: {course.code}</span></div>)}</div>}</div></div>
      <div className="bg-white rounded-xl shadow-sm border"><div className="p-6 border-b"><h2 className="text-xl font-semibold">Recent Attendance</h2></div><div className="p-6">{attendance.length === 0 ? <p className="text-gray-600">No attendance records yet.</p> : <div className="space-y-3">{attendance.slice(0, 10).map((record) => <div key={record._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg"><div><p className="font-medium">Class Session</p><p className="text-sm text-gray-600">{new Date(record.markedAt).toLocaleString()}</p></div><CheckCircle className="h-6 w-6 text-green-600"/></div>)}</div>}</div></div>
    </div>
  );
}
