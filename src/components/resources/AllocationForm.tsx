'use client';

import { useState } from 'react';
import { FiX, FiLock } from 'react-icons/fi';
import { useResource } from '@/contexts/ResourceContext';
import { Resource, Allocation } from '@/types';

interface AllocationFormProps {
  resource: Resource;
  currentAllocation: Allocation | null;
  onClose: () => void;
}

export default function AllocationForm({
  resource,
  currentAllocation,
  onClose,
}: AllocationFormProps) {
  // Default to 1 for additional amount
  const [additionalAmount, setAdditionalAmount] = useState('1');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const { allocateResource } = useResource();

  const isAllocated = !!currentAllocation;
  const currentAmount = currentAllocation?.amount || 0;
  const maxAvailable = resource.remainingAmount;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!additionalAmount) {
      setError('请填写占用数量');
      return;
    }

    const amountToAdd = parseInt(additionalAmount, 10);

    if (isNaN(amountToAdd) || amountToAdd <= 0) {
      setError('占用数量必须是正整数');
      return;
    }

    if (amountToAdd > maxAvailable) {
      setError(`可用资源数量不足，最大可占用数量为 ${maxAvailable}`);
      return;
    }

    try {
      setLoading(true);
      setError('');

      // Calculate new total allocation
      const newTotal = currentAmount + amountToAdd;

      await allocateResource(resource.id, newTotal);
      onClose();
    } catch (error: unknown) {
      console.error('资源分配错误:', error);
      setError(error instanceof Error ? error.message : '操作失败');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">资源占用</h3>
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
              可用数量: <span className="font-medium">{resource.remainingAmount}</span> /{' '}
              {resource.totalAmount}
            </p>
            {isAllocated && (
              <p className="text-sm text-blue-600 mt-1">
                您当前占用: <span className="font-medium">{currentAllocation.amount}</span>
              </p>
            )}
          </div>

          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">{error}</div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="mb-6">
              <label className="block text-gray-700 mb-2" htmlFor="additionalAmount">
                新增占用数量
              </label>
              <input
                id="additionalAmount"
                type="number"
                value={additionalAmount}
                onChange={e => setAdditionalAmount(e.target.value)}
                className="w-full py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="请输入占用数量"
                min="1"
                max={maxAvailable}
                disabled={loading}
              />
              <p className="mt-1 text-xs text-gray-500">输入要新增的占用数量，不能超过可用资源数</p>
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
                className="flex items-center gap-2 py-2 px-4 bg-blue-500 hover:bg-blue-600 text-white rounded-md transition duration-200"
                disabled={loading}
              >
                {loading ? (
                  '保存中...'
                ) : (
                  <>
                    <FiLock size={16} /> 占用
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
