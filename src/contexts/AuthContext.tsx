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
        toastError(data.error || 'Registration failed');
        return { success: false, error: data.error || 'Registration failed' };
      }

      toastSuccess('Account created successfully');

      // Auto-login after successful registration
      const signInResult = await signIn('credentials', {
        redirect: false,
        email: credentials.email,
        password: credentials.password,
      });

      if (signInResult?.error) {
        toastWarning('Account created but login failed');
        return { success: false, error: 'Account created but login failed' };
      }

      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Registration failed';
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
        toastError('Invalid credentials');
        return { success: false, error: 'Invalid credentials' };
      }

      toastSuccess('Signed in successfully');
      return { success: true };
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign in failed';
      toastError(errorMessage);
      return { success: false, error: errorMessage };
    }
  };

  const handleSignOut = async (): Promise<void> => {
    try {
      await signOut({ redirect: false });
      toastSuccess('Signed out successfully');
    } catch (error) {
      const errorMessage = error instanceof Error ? error.message : 'Sign out failed';
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
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}