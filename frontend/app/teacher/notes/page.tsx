'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/hooks/useAuth';
import { courseService, noteService } from '@/services/api';
import type { Course, Note } from '@/types';

export default function TeacherNotes() {
  const router = useRouter();
  const { user, loading } = useAuth();
  const [courses, setCourses] = useState<Course[]>([]);
  const [notes, setNotes] = useState<Note[]>([]);
  const [form, setForm] = useState({ courseId: '', title: '', description: '', topic: '', fileUrl: '' });
  const [error, setError] = useState('');

  const load = async () => {
    const [coursesRes, notesRes] = await Promise.all([courseService.getCourses(), noteService.getNotes()]);
    if (coursesRes.success && coursesRes.data) setCourses(coursesRes.data);
    if (notesRes.success && notesRes.data) setNotes(notesRes.data.notes || []);
  };
  useEffect(() => { if (!loading && (!user || user.role !== 'teacher')) router.replace('/login'); if (user?.role === 'teacher') void load(); }, [user, loading, router]);

  const create = async (event: React.FormEvent) => {
    event.preventDefault(); setError('');
    try { await noteService.createNote({ ...form, fileUrl: form.fileUrl || undefined }); setForm({ courseId: '', title: '', description: '', topic: '', fileUrl: '' }); await load(); }
    catch (e) { setError(e instanceof Error ? e.message : 'Unable to create note'); }
  };

  if (loading || !user) return <div className="p-8">Loading…</div>;
  return <main className="max-w-6xl mx-auto p-8"><h1 className="text-3xl font-bold">Course Notes</h1><form onSubmit={create} className="mt-6 grid gap-3 max-w-xl border rounded-xl p-5"><select required className="border rounded p-3" value={form.courseId} onChange={e => setForm({ ...form, courseId: e.target.value })}><option value="">Select course</option>{courses.map(c => <option key={c._id} value={c._id}>{c.name} ({c.code})</option>)}</select><input required minLength={2} placeholder="Title" className="border rounded p-3" value={form.title} onChange={e => setForm({ ...form, title: e.target.value })}/><input placeholder="Topic" className="border rounded p-3" value={form.topic} onChange={e => setForm({ ...form, topic: e.target.value })}/><textarea placeholder="Description" className="border rounded p-3" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })}/><input type="url" placeholder="File URL (optional)" className="border rounded p-3" value={form.fileUrl} onChange={e => setForm({ ...form, fileUrl: e.target.value })}/>{error && <p className="text-red-600">{error}</p>}<button className="rounded bg-black text-white p-3">Publish Note</button></form><section className="mt-8 grid gap-4">{notes.map(n => <article key={n._id} className="border rounded-xl p-5"><h2 className="font-semibold text-xl">{n.title}</h2><p className="text-gray-500">{n.topic}</p><p className="mt-2">{n.description}</p>{n.fileUrl && <a className="text-blue-600 underline" href={n.fileUrl} target="_blank" rel="noreferrer">Open resource</a>}</article>)}</section></main>;
}
