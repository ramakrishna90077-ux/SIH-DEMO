'use client';

import Link from 'next/link';
import { useAuth } from '@/hooks/useAuth';
import { LogOut, User, BookOpen, ClipboardList, FileText, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Navbar() {
  const { user, logout } = useAuth();
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const getDashboardLink = () => {
    if (!user) return '/';
    return user.role === 'teacher' ? '/teacher/dashboard' : '/student/dashboard';
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link href="/" className="flex-shrink-0 flex items-center">
              <ClipboardList className="h-8 w-8 text-blue-600" />
              <span className="ml-2 text-xl font-bold text-gray-900">Attendly</span>
            </Link>
          </div>

          {/* Desktop menu */}
          <div className="hidden md:flex items-center space-x-4">
            {user ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Dashboard
                </Link>
                {user.role === 'teacher' ? (
                  <>
                    <Link
                      href="/teacher/courses"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Courses
                    </Link>
                    <Link
                      href="/teacher/notes"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Notes
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/student/courses"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      My Courses
                    </Link>
                    <Link
                      href="/student/notes"
                      className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                    >
                      Notes
                    </Link>
                  </>
                )}
                <button
                  onClick={logout}
                  className="flex items-center text-gray-700 hover:text-red-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  <LogOut className="h-4 w-4 mr-1" />
                  Logout
                </button>
                <div className="flex items-center ml-4 pl-4 border-l">
                  <User className="h-5 w-5 text-gray-500" />
                  <span className="ml-2 text-sm text-gray-700">{user.name}</span>
                  <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                    {user.role}
                  </span>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="text-gray-700 hover:text-blue-600 px-3 py-2 rounded-md text-sm font-medium"
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="bg-blue-600 text-white hover:bg-blue-700 px-4 py-2 rounded-md text-sm font-medium"
                >
                  Register
                </Link>
              </>
            )}
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center">
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="text-gray-700 hover:text-gray-900 p-2"
            >
              {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t">
          <div className="px-2 pt-2 pb-3 space-y-1">
            {user ? (
              <>
                <Link
                  href={getDashboardLink()}
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Dashboard
                </Link>
                {user.role === 'teacher' ? (
                  <>
                    <Link
                      href="/teacher/courses"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Courses
                    </Link>
                    <Link
                      href="/teacher/notes"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Notes
                    </Link>
                  </>
                ) : (
                  <>
                    <Link
                      href="/student/courses"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      My Courses
                    </Link>
                    <Link
                      href="/student/notes"
                      className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                      onClick={() => setMobileMenuOpen(false)}
                    >
                      Notes
                    </Link>
                  </>
                )}
                <button
                  onClick={() => {
                    logout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-red-600 hover:bg-gray-50"
                >
                  Logout
                </button>
                <div className="border-t mt-2 pt-2 px-3">
                  <div className="flex items-center">
                    <User className="h-5 w-5 text-gray-500" />
                    <span className="ml-2 text-sm text-gray-700">{user.name}</span>
                    <span className="ml-2 px-2 py-1 text-xs rounded-full bg-blue-100 text-blue-800 capitalize">
                      {user.role}
                    </span>
                  </div>
                </div>
              </>
            ) : (
              <>
                <Link
                  href="/login"
                  className="block px-3 py-2 rounded-md text-base font-medium text-gray-700 hover:text-blue-600 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Login
                </Link>
                <Link
                  href="/register"
                  className="block px-3 py-2 rounded-md text-base font-medium text-blue-600 hover:text-blue-700 hover:bg-gray-50"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  Register
                </Link>
              </>
            )}
          </div>
        </div>
      )}
    </nav>
  );
}
