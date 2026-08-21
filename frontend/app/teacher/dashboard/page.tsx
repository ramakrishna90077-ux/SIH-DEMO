'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { attendanceService, courseService } from '@/services/api';
import type { Course } from '@/types';

export default function TeacherDashboard() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [message, setMessage] = useState('');
  const [activeCode, setActiveCode] = useState<string | null>(null);

  useEffect(() => {
    if (!loading && (!user || user.role !== 'teacher')) router.replace('/login');
    if (user?.role === 'teacher') void load();
  }, [user, loading, router]);

  const load = async () => {
    const response = await courseService.getCourses();
    if (response.success && response.data) setCourses(response.data);
  };

  const start = async (courseId: string) => {
    try {
      const response = await attendanceService.startSession(courseId, 10);
      if (response.success && response.data) {
        const data = response.data as unknown as { code?: string };
        setActiveCode(data.code || null);
        setMessage('Attendance session started. Share this code with students.');
      }
    } catch (error) { setMessage(error instanceof Error ? error.message : 'Unable to start session'); }
  };

  if (loading || !user) return <div className="p-8">Loading…</div>;
  return <main className="max-w-7xl mx-auto p-8">
    <h1 className="text-3xl font-bold">Teacher Dashboard</h1>
    <p className="text-gray-600 mt-1">Welcome, {user.name}</p>
    {message && <div className="mt-6 p-4 rounded-lg bg-blue-50 border border-blue-200">{message}{activeCode && <strong className="block text-3xl tracking-widest mt-2">{activeCode}</strong>}</div>}
    <div className="flex gap-3 mt-6"><button className="px-4 py-2 rounded bg-black text-white" onClick={() => router.push('/teacher/courses')}>Manage Courses</button><button className="px-4 py-2 rounded border" onClick={() => router.push('/teacher/notes')}>Manage Notes</button></div>
    <section className="mt-8 grid gap-4 md:grid-cols-2">
      {courses.map(course => <div key={course._id} className="border rounded-xl p-5 bg-white"><h2 className="font-semibold text-xl">{course.name}</h2><p className="text-sm text-gray-500">{course.code}</p><p className="mt-3">Students: {Array.isArray(course.students) ? course.students.length : 0}</p><button onClick={() => void start(course._id)} className="mt-4 px-4 py-2 rounded bg-blue-600 text-white">Start 10-minute Attendance</button></div>)}
    </section>
  </main>;
}
