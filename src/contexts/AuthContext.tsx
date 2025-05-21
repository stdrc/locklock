'use client';

import { createContext, useContext, ReactNode } from 'react';
import { useSession, signIn, signOut } from 'next-auth/react';

interface AuthContextType {
  user: any;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  signIn: (credentials: { email: string; password: string }) => Promise<any>;
  signOut: () => Promise<void>;
  register: (credentials: { email: string; password: string }) => Promise<any>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const { data: session, status } = useSession();

  const register = async (credentials: { email: string; password: string }) => {
    try {
      const res = await fetch('/api/register', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(credentials),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '注册失败');
      }

      // Auto-login after successful registration
      return signIn('credentials', {
        redirect: false,
        email: credentials.email,
        password: credentials.password,
      });
    } catch (error) {
      console.error('注册错误:', error);
      throw error;
    }
  };

  const customSignIn = (credentials: { email: string; password: string }) => {
    return signIn('credentials', {
      redirect: false,
      email: credentials.email,
      password: credentials.password,
    });
  };

  const value = {
    user: session?.user,
    status: status,
    signIn: customSignIn,
    signOut,
    register,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
} 