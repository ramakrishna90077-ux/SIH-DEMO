'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import LoadingSpinner from '@/components/LoadingSpinner';

export default function RegisterPage() {
  const router = useRouter();
  const { register } = useAuth();
  const [formData, setFormData] = useState({ name: '', email: '', password: '', confirmPassword: '', rollNumber: '' });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => setFormData(p => ({ ...p, [e.target.name]: e.target.value }));
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault(); setError('');
    if (formData.password !== formData.confirmPassword) return setError('Passwords do not match');
    if (formData.password.length < 8) return setError('Password must be at least 8 characters long');
    setLoading(true);
    try { await register(formData.name, formData.email, formData.password, 'student', formData.rollNumber); router.push('/student/dashboard'); router.refresh(); }
    catch (err) { setError(err instanceof Error ? err.message : 'Registration failed. Please try again.'); }
    finally { setLoading(false); }
  };
  return <div className="min-h-[calc(100vh-4rem)] flex items-center justify-center bg-gray-50 py-12 px-4"><div className="max-w-md w-full space-y-8"><div><h2 className="text-center text-3xl font-extrabold text-gray-900">Create your student account</h2><p className="mt-2 text-center text-sm text-gray-600">Already have an account? <Link href="/login" className="font-medium text-blue-600">Sign in</Link></p><p className="mt-2 text-center text-xs text-gray-500">Teacher accounts are provisioned by the institution administrator.</p></div><form className="space-y-6" onSubmit={handleSubmit}>{error && <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg">{error}</div>}<input name="name" type="text" required maxLength={100} value={formData.name} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Full name"/><input name="email" type="email" required maxLength={254} value={formData.email} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Email address"/><input name="rollNumber" type="text" required maxLength={50} value={formData.rollNumber} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Roll number / Student ID"/><input name="password" type="password" required minLength={8} maxLength={72} value={formData.password} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Password (8+ characters)"/><input name="confirmPassword" type="password" required minLength={8} maxLength={72} value={formData.confirmPassword} onChange={handleChange} className="w-full px-3 py-2 border rounded-lg" placeholder="Confirm password"/><button type="submit" disabled={loading} className="w-full py-2 px-4 rounded-lg text-white bg-blue-600 disabled:opacity-50">{loading ? <LoadingSpinner size="sm" /> : 'Create student account'}</button></form></div></div>;
}
