'use client';

import { useState } from 'react';
import { FiX, FiUnlock } from 'react-icons/fi';
import { useResource } from '@/contexts/ResourceContext';

interface ReleaseFormProps {
  resource: any;
  currentAllocation: any;
  onClose: () => void;
}

export default function ReleaseForm({ 
  resource, 
  currentAllocation, 
  onClose 
}: ReleaseFormProps) {
  const [releaseAmount, setReleaseAmount] = useState('1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { allocateResource } = useResource();
  
  // Calculate new amount after release
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!releaseAmount) {
      setError('请填写释放数量');
      return;
    }
    
    const amountToRelease = parseInt(releaseAmount, 10);
    
    if (isNaN(amountToRelease) || amountToRelease <= 0) {
      setError('释放数量必须是正整数');
      return;
    }
    
    if (amountToRelease > currentAllocation.amount) {
      setError(`释放数量不能超过当前占用量 ${currentAllocation.amount}`);
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      // Calculate new allocation amount
      const newAmount = currentAllocation.amount - amountToRelease;
      
      // Update allocation with new amount
      await allocateResource(resource.id, newAmount);
      onClose();
    } catch (error: any) {
      console.error('资源释放错误:', error);
      setError(error.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">资源释放</h3>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <div className="p-4">
          <div className="mb-4 bg-blue-50 p-3 rounded-md">
            <h4 className="font-medium text-blue-700 mb-1">{resource.name}</h4>
            <p className="text-sm text-blue-600">
              可用数量: <span className="font-medium">{resource.remainingAmount}</span> / {resource.totalAmount}
            </p>
            <p className="text-sm text-blue-600 mt-1">
              您当前占用: <span className="font-medium">{currentAllocation.amount}</span>
            </p>
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="releaseAmount">
                释放数量
              </label>
              <input
                id="releaseAmount"
                type="number"
                value={releaseAmount}
                onChange={(e) => setReleaseAmount(e.target.value)}
                className="w-full py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入释放数量"
                min="1"
                max={currentAllocation.amount}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                释放数量不能超过当前占用量
              </p>
            </div>
            
            <div className="flex justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="py-2 px-4 border border-gray-300 rounded-md text-gray-700 hover:bg-gray-50 transition duration-200"
                disabled={loading}
              >
                取消
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 py-2 px-4 bg-red-500 hover:bg-red-600 text-white rounded-md transition duration-200"
                disabled={loading}
              >
                {loading ? '释放中...' : (
                  <>
                    <FiUnlock size={16} /> 释放
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 