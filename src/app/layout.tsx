import './globals.css';
import { Inter } from 'next/font/google';
import type { Metadata } from 'next';
import { NextAuthProvider } from '@/components/providers/NextAuthProvider';
import { AuthProvider } from '@/contexts/AuthContext';
import { ResourceProvider } from '@/contexts/ResourceContext';
import Navbar from '@/components/layout/Navbar';

const inter = Inter({ subsets: ['latin'] });

export const metadata: Metadata = {
  title: 'LockLock',
  description: '一个用于分配和管理资源的应用',
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="zh">
      <body className={inter.className}>
        <NextAuthProvider>
          <AuthProvider>
            <ResourceProvider>
              <div className="flex flex-col min-h-screen">
                <Navbar />
                <main className="flex-grow container mx-auto px-4 py-8">
                  {children}
                </main>
                <footer className="py-4 text-center text-sm text-gray-500 bg-gray-50">
                  LockLock &copy; {new Date().getFullYear()}
                </footer>
              </div>
            </ResourceProvider>
          </AuthProvider>
        </NextAuthProvider>
      </body>
    </html>
  );
}
