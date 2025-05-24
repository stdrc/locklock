'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { FiBox, FiUser, FiLogOut } from 'react-icons/fi';

export default function Navbar() {
  const pathname = usePathname();
  const { status, signOut } = useAuth();

  const isActive = (path: string) => pathname === path;

  return (
    <nav className="bg-white shadow-md">
      <div className="container mx-auto px-4">
        <div className="flex justify-between items-center py-4">
          <Link href="/" className="text-xl font-bold text-blue-600 flex items-center gap-2">
            <FiBox className="inline" />
            LockLock
          </Link>

          <div className="flex items-center space-x-6">
            <Link
              href="/"
              className={`flex items-center gap-1 ${isActive('/') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-500'}`}
            >
              <FiBox className="inline" /> 资源
            </Link>

            {status === 'authenticated' ? (
              <>
                <Link
                  href="/profile"
                  className={`flex items-center gap-1 ${isActive('/profile') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-500'}`}
                >
                  <FiUser className="inline" /> 我的
                </Link>

                <button
                  onClick={() => signOut()}
                  className="flex items-center gap-1 text-gray-600 hover:text-red-500"
                >
                  <FiLogOut className="inline" /> 退出
                </button>
              </>
            ) : (
              <div className="flex items-center space-x-4">
                <Link
                  href="/login"
                  className={`flex items-center gap-1 ${isActive('/login') ? 'text-blue-600 font-medium' : 'text-gray-600 hover:text-blue-500'}`}
                >
                  <FiUser className="inline" /> 登录
                </Link>
                <Link
                  href="/register"
                  className={`bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200 ${isActive('/register') ? 'bg-blue-600' : ''}`}
                >
                  注册
                </Link>
              </div>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
