import type { Metadata } from 'next';
import './globals.css';
import { AuthProvider } from '@/hooks/useAuth';
import { SocketProvider } from '@/hooks/useSocket';
import Navbar from '@/components/Navbar';

export const metadata: Metadata = {
  title: 'Attendly - Student Attendance & Notes Management',
  description: 'A modern platform for managing class attendance and sharing study materials',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en">
      <body className="bg-gray-50 min-h-screen">
        <AuthProvider>
          <SocketProvider>
            <Navbar />
            <main>{children}</main>
          </SocketProvider>
        </AuthProvider>
      </body>
    </html>
  );
}
