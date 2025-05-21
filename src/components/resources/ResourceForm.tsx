'use client';

import { useState, useEffect } from 'react';
import { FiX, FiSave } from 'react-icons/fi';
import { useResource } from '@/contexts/ResourceContext';

interface ResourceFormProps {
  resource: any;
  onClose: () => void;
}

export default function ResourceForm({ resource, onClose }: ResourceFormProps) {
  const [name, setName] = useState('');
  const [totalAmount, setTotalAmount] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { createResource, updateResource } = useResource();
  
  const isEditing = !!resource;
  
  useEffect(() => {
    if (resource) {
      setName(resource.name);
      setTotalAmount(resource.totalAmount.toString());
    }
  }, [resource]);
  
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !totalAmount) {
      setError('请填写所有字段');
      return;
    }
    
    const amount = parseInt(totalAmount, 10);
    
    if (isNaN(amount) || amount <= 0) {
      setError('资源数量必须是大于0的整数');
      return;
    }
    
    try {
      setLoading(true);
      setError('');
      
      if (isEditing) {
        await updateResource(resource.id, { name, totalAmount: amount });
      } else {
        await createResource({ name, totalAmount: amount });
      }
      
      onClose();
    } catch (error: any) {
      console.error(isEditing ? '更新资源错误:' : '创建资源错误:', error);
      setError(error.message || '操作失败');
    } finally {
      setLoading(false);
    }
  };
  
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="bg-white rounded-lg shadow-xl w-full max-w-md overflow-hidden">
        <div className="flex justify-between items-center p-4 border-b">
          <h3 className="text-lg font-medium">
            {isEditing ? '编辑资源' : '添加资源'}
          </h3>
          <button 
            onClick={onClose}
            className="p-1 text-gray-400 hover:text-gray-600 rounded-full hover:bg-gray-100"
          >
            <FiX size={20} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="p-4">
          {error && (
            <div className="mb-4 p-3 bg-red-50 text-red-500 rounded-md text-sm">
              {error}
            </div>
          )}
          
          <div className="mb-4">
            <label className="block text-gray-700 mb-2" htmlFor="name">
              资源名称
            </label>
            <input
              id="name"
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              className="w-full py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入资源名称"
              disabled={loading}
            />
          </div>
          
          <div className="mb-6">
            <label className="block text-gray-700 mb-2" htmlFor="totalAmount">
              资源总量
            </label>
            <input
              id="totalAmount"
              type="number"
              value={totalAmount}
              onChange={(e) => setTotalAmount(e.target.value)}
              className="w-full py-2 px-3 rounded-md border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="请输入资源总量"
              min="1"
              disabled={loading}
            />
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
              {loading ? '保存中...' : (
                <>
                  <FiSave size={16} /> 保存
                </>
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
} 