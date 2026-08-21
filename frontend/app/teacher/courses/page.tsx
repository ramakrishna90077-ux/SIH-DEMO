'use client';

import { FormEvent, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { courseService } from '@/services/api';
import type { Course } from '@/types';

export default function TeacherCourses() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [form, setForm] = useState({ name: '', code: '', description: '' });
  const [error, setError] = useState('');

  const load = async () => { const response = await courseService.getCourses(); if (response.success && response.data) setCourses(response.data); };
  useEffect(() => { if (!loading && (!user || user.role !== 'teacher')) router.replace('/login'); if (user?.role === 'teacher') void load(); }, [user, loading, router]);

  const create = async (event: FormEvent) => { event.preventDefault(); setError(''); try { await courseService.createCourse(form); setForm({ name: '', code: '', description: '' }); await load(); } catch (e) { setError(e instanceof Error ? e.message : 'Unable to create course'); } };

  if (loading || !user) return <div className="p-8">Loading…</div>;
  return <main className="max-w-6xl mx-auto p-8"><h1 className="text-3xl font-bold">My Courses</h1><form onSubmit={create} className="mt-6 grid gap-3 max-w-xl border rounded-xl p-5"><input required minLength={2} placeholder="Course name" className="border rounded p-3" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}/><input required minLength={2} placeholder="Course code" className="border rounded p-3" value={form.code} onChange={e => setForm({ ...form, code: e.target.value })}/><textarea placeholder="Description" className="border rounded p-3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/>{error && <p className="text-red-600">{error}</p>}<button className="rounded bg-black text-white p-3">Create Course</button></form><div className="mt-8 grid gap-4 md:grid-cols-2">{courses.map(c => <div key={c._id} className="border rounded-xl p-5"><h2 className="font-semibold text-xl">{c.name}</h2><p className="text-gray-500">Join code: <strong>{c.code}</strong></p><p className="mt-2">Students: {Array.isArray(c.students) ? c.students.length : 0}</p></div>)}</div></main>;
}
