'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { FiMail, FiBox, FiTrash2 } from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useResource } from '@/contexts/ResourceContext';

export default function ProfilePage() {
  const { user, status } = useAuth();
  const { allocations, loading, releaseResource } = useResource();
  const router = useRouter();

  // Filter out allocations with amount 0
  const validAllocations = allocations.filter(allocation => allocation.amount > 0);

  useEffect(() => {
    if (status === 'unauthenticated') {
      router.push('/login');
    }
  }, [status, router]);

  const handleReleaseResource = async (resourceId: string) => {
    if (confirm('确定要释放此资源吗？')) {
      try {
        await releaseResource(resourceId);
      } catch (error) {
        console.error('释放资源错误:', error);
      }
    }
  };

  if (status === 'loading') {
    return (
      <div className="flex justify-center items-center min-h-[50vh]">
        <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  if (status === 'unauthenticated') {
    return null;
  }

  return (
    <div>
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-bold mb-4">我的信息</h2>

        <div className="flex items-center gap-2 text-gray-700 mb-2">
          <FiMail className="text-blue-500" />
          <span className="font-medium">邮箱：</span>
          <span>{user?.email}</span>
        </div>
      </div>

      <div className="bg-white rounded-lg shadow-md p-6">
        <h2 className="text-xl font-bold mb-4">我的资源</h2>

        {validAllocations.length === 0 ? (
          <div className="text-center py-8 text-gray-500">您还没有占用任何资源</div>
        ) : (
          <div className="grid gap-4">
            {validAllocations.map(allocation => (
              <div
                key={allocation.id}
                className="border border-gray-200 rounded-lg p-4 flex justify-between items-center"
              >
                <div className="flex items-center gap-3">
                  <div className="p-2 bg-blue-100 rounded-full text-blue-500">
                    <FiBox size={20} />
                  </div>
                  <div>
                    <h3 className="font-medium">{allocation.resource.name}</h3>
                    <p className="text-sm text-gray-500">
                      占用数量:{' '}
                      <span className="text-blue-600 font-medium">{allocation.amount}</span>
                    </p>
                  </div>
                </div>

                <button
                  onClick={() => handleReleaseResource(allocation.resourceId)}
                  className="p-2 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                  disabled={loading}
                >
                  <FiTrash2 size={18} />
                </button>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
