'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';
import { User, AuthSignInResponse, AuthCredentials } from '@/types';
import { useToast } from './ToastContext';

interface AuthContextType {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  signIn: (credentials: AuthCredentials) => Promise<AuthSignInResponse>;
  signOut: () => Promise<void>;
  register: (credentials: AuthCredentials) => Promise<AuthSignInResponse>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();
  const { success: toastSuccess, error: toastError, warning: toastWarning } = useToast();

  const register = async (credentials: AuthCredentials): Promise<AuthSignInResponse> => {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        toastError(data.error || '注册失败');
        return { success: false, error: data.error || '注册失败' };
      }

      toastSuccess('账号创建成功');

      // Auto-login after successful registration
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: credentials.email,
        password: credentials.password,
      });

      if (signInResult?.error) {
        toastWarning('账号创建成功但登录失败');
        return { success: false, error: '账号创建成功但登录失败' };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '注册失败';
      toastError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const customSignIn = async (credentials: AuthCredentials): Promise<AuthSignInResponse> => {
    try {
      const result = await signIn('credentials', {
        redirect: false,
        email: credentials.email,
        password: credentials.password,
      });

      if (result?.error) {
        toastError('邮箱或密码错误');
        return { success: false, error: '邮箱或密码错误' };
      }

      toastSuccess('登录成功');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '登录失败';
      toastError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut({ redirect: false });
      toastSuccess('退出登录成功');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : '退出登录失败';
      toastError(errorMessage);
    }
  };

  const value: AuthContextType = {
    user: session?.user as User | null,
    status,
    signIn: customSignIn,
    signOut: handleSignOut,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth 必须在 AuthProvider 内使用');
  }
  return context;
}