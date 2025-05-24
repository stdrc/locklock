'use client';

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import { useAuth } from './AuthContext';

interface Resource {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  createdAt: string;
  updatedAt: string;
}

interface Allocation {
  id: string;
  amount: number;
  userId: string;
  resourceId: string;
  resource: Resource;
  createdAt: string;
  updatedAt: string;
}

interface ResourceContextType {
  resources: Resource[];
  allocations: Allocation[];
  loading: boolean;
  error: string | null;
  fetchResources: () => Promise<void>;
  fetchAllocations: () => Promise<void>;
  createResource: (data: { name: string; totalAmount: number }) => Promise<Resource>;
  updateResource: (id: string, data: { name: string; totalAmount: number }) => Promise<Resource>;
  deleteResource: (id: string) => Promise<void>;
  allocateResource: (resourceId: string, amount: number) => Promise<Allocation>;
  releaseResource: (resourceId: string) => Promise<void>;
}

const ResourceContext = createContext<ResourceContextType | undefined>(undefined);

export function ResourceProvider({ children }: { children: ReactNode }) {
  const [resources, setResources] = useState<Resource[]>([]);
  const [allocations, setAllocations] = useState<Allocation[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const { status } = useAuth();

  const fetchResources = useCallback(async () => {
    try {
      setLoading(true);
      const res = await fetch('/api/resources');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '获取资源失败');
      }

      setResources(data);
      return data;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '获取资源失败');
      console.error('获取资源错误:', error);
    } finally {
      setLoading(false);
    }
  }, []);

  const fetchAllocations = useCallback(async () => {
    if (status !== 'authenticated') return;

    try {
      setLoading(true);
      const res = await fetch('/api/allocations');
      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '获取分配信息失败');
      }

      setAllocations(data);
      return data;
    } catch (error: unknown) {
      setError(error instanceof Error ? error.message : '获取分配信息失败');
      console.error('获取分配信息错误:', error);
    } finally {
      setLoading(false);
    }
  }, [status]);

  const createResource = async (data: { name: string; totalAmount: number }) => {
    try {
      setLoading(true);
      const res = await fetch('/api/resources', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || '创建资源失败');
      }

      await fetchResources();
      return responseData;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '创建资源失败';
      setError(errorMessage);
      console.error('创建资源错误:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const updateResource = async (id: string, data: { name: string; totalAmount: number }) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/resources/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      const responseData = await res.json();

      if (!res.ok) {
        throw new Error(responseData.error || '更新资源失败');
      }

      await fetchResources();
      return responseData;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '更新资源失败';
      setError(errorMessage);
      console.error('更新资源错误:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const deleteResource = async (id: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/resources/${id}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '删除资源失败');
      }

      await fetchResources();
      await fetchAllocations();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '删除资源失败';
      setError(errorMessage);
      console.error('删除资源错误:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const allocateResource = async (resourceId: string, amount: number) => {
    try {
      setLoading(true);
      const res = await fetch('/api/allocations', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ resourceId, amount }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || '分配资源失败');
      }

      await fetchResources();
      await fetchAllocations();
      return data;
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '分配资源失败';
      setError(errorMessage);
      console.error('分配资源错误:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  const releaseResource = async (resourceId: string) => {
    try {
      setLoading(true);
      const res = await fetch(`/api/allocations?resourceId=${resourceId}`, {
        method: 'DELETE',
      });

      if (!res.ok) {
        const data = await res.json();
        throw new Error(data.error || '释放资源失败');
      }

      await fetchResources();
      await fetchAllocations();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : '释放资源失败';
      setError(errorMessage);
      console.error('释放资源错误:', error);
      throw error;
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchResources();
  }, [fetchResources]);

  useEffect(() => {
    if (status === 'authenticated') {
      fetchAllocations();
    }
  }, [status, fetchAllocations]);

  const value = {
    resources,
    allocations,
    loading,
    error,
    fetchResources,
    fetchAllocations,
    createResource,
    updateResource,
    deleteResource,
    allocateResource,
    releaseResource,
  };

  return <ResourceContext.Provider value={value}>{children}</ResourceContext.Provider>;
}

export function useResource() {
  const context = useContext(ResourceContext);
  if (context === undefined) {
    throw new Error('useResource 必须在 ResourceProvider 内使用');
  }
  return context;
}
