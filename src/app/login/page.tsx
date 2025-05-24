'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '@/contexts/AuthContext';
import { FiMail, FiLock, FiLogIn, FiUserPlus } from 'react-icons/fi';

export default function LoginPage() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { signIn } = useAuth();
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!email || !password) {
      setError('请填写邮箱和密码');
      return;
    }

    try {
      setLoading(true);
      setError('');

      const result = await signIn({ email, password });

      if (result?.error) {
        setError('邮箱或密码错误');
        return;
      }

      router.push('/');
    } catch (error) {
      console.error('登录错误:', error);
      setError('登录时发生错误');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-md mx-auto mt-10">
      <div className="bg-white rounded-lg shadow-lg overflow-hidden">
        <div className="p-8">
          <h2 className="text-2xl font-bold text-center mb-6">用户登录</h2>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-4">
              <label className="block text-gray-700 mb-2" htmlFor="email">
                邮箱
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <FiMail />
                </div>
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入邮箱"
                />
              </div>
            </div>

            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="password">
                密码
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <FiLock />
                </div>
                <input
                  id="password"
                  type="password"
                  value={password}
                  onChange={e => setPassword(e.target.value)}
                  className="w-full pl-10 pr-3 py-2 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="请输入密码"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200 flex items-center justify-center gap-2"
            >
              {loading ? (
                '登录中...'
              ) : (
                <>
                  <FiLogIn /> 登录
                </>
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-gray-600">
              还没有账号？{' '}
              <Link
                href="/register"
                className="text-blue-500 hover:underline inline-flex items-center gap-1"
              >
                <FiUserPlus className="inline" /> 立即注册
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
