'use client';

import { useState, useEffect } from 'react';
import { FiX, FiSave, FiTrash2 } from 'react-icons/fi';
import { useResource } from '@/contexts/ResourceContext';

interface AllocationFormProps {
  resource: any;
  currentAllocation: any;
  onClose: () => void;
}

export default function AllocationForm({ 
  resource, 
  currentAllocation, 
  onClose 
}: AllocationFormProps) {
  const [amount, setAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { allocateResource, releaseResource } = useResource();
  
  const isAllocated = !!currentAllocation;
  const maxAvailable = resource.remainingAmount + (currentAllocation?.amount || 0);
  
  useEffect(() => {
    if (currentAllocation) {
      setAmount(currentAllocation.amount.toString());
    } else {
      setAmount('1'); // Default to 1 for new allocations
    }
  }, [currentAllocation]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!amount) {
      setError('请填写占用数量');
      return;
    }
    
    const allocationAmount = parseInt(amount, 10);
    
    if (isNaN(allocationAmount) || allocationAmount < 0) {
      setError('占用数量必须是非负整数');
      return;
    }
    
    if (allocationAmount > maxAvailable) {
      setError(`可用资源数量不足，最大可占用数量为 ${maxAvailable}`);
      return;
    }
    
    // If amount is 0, release the allocation
    if (allocationAmount === 0 && isAllocated) {
      handleRelease();
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      await allocateResource(resource.id, allocationAmount);
      onClose();
    } catch (error: any) {
      console.error('资源分配错误:', error);
      setError(error.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };
  
  const handleRelease = async () => {
    if (!isAllocated) return;
    
    try {
      setLoading(true);
      setError('');
      
      await releaseResource(resource.id);
      onClose();
    } catch (error: any) {
      console.error('释放资源错误:', error);
      setError(error.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black bg-opacity-50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">
            {isAllocated ? '调整资源占用' : '资源占用'}
          </h3>
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
            {isAllocated && (
              <p className="text-sm text-blue-600 mt-1">
                您当前占用: <span className="font-medium">{currentAllocation.amount}</span>
              </p>
            )}
          </div>
          
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="amount">
                占用数量
              </label>
              <input
                id="amount"
                type="number"
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                className="w-full py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入占用数量"
                min="0"
                max={maxAvailable}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">
                输入0表示释放所有占用
              </p>
            </div>
            
            <div className="flex justify-between">
              {isAllocated && (
                <button
                  type="button"
                  onClick={handleRelease}
                  className="flex items-center gap-1 py-2 px-4 text-red-500 border border-red-300 rounded-md hover:bg-red-50 transition duration-200"
                  disabled={loading}
                >
                  <FiTrash2 size={16} /> 释放资源
                </button>
              )}
              
              <div className={`flex gap-3 ${isAllocated ? '' : 'ml-auto'}`}>
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
                  className="flex items-center gap-2 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition duration-200"
                  disabled={loading}
                >
                  {loading ? '保存中...' : (
                    <>
                      <FiSave size={16} /> 保存
                    </>
                  )}
                </button>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
} 