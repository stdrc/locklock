'use client';

import { useState } from 'react';
import Link from 'next/link';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FiPlus, FiEdit2, FiTrash2, FiLink, 
  FiAlertCircle, FiCheckCircle, FiUser
} from 'react-icons/fi';
import { useAuth } from '@/contexts/AuthContext';
import { useResource } from '@/contexts/ResourceContext';
import ResourceForm from '@/components/resources/ResourceForm';
import AllocationForm from '@/components/resources/AllocationForm';
import ReleaseForm from '@/components/resources/ReleaseForm';

export default function HomePage() {
  const { user, status } = useAuth();
  const { resources, allocations, loading, deleteResource } = useResource();
  
  const [isResourceModalOpen, setIsResourceModalOpen] = useState(false);
  const [isAllocationModalOpen, setIsAllocationModalOpen] = useState(false);
  const [isReleaseModalOpen, setIsReleaseModalOpen] = useState(false);
  const [editingResource, setEditingResource] = useState<any>(null);
  const [allocatingResource, setAllocatingResource] = useState<any>(null);
  const [releasingResource, setReleasingResource] = useState<any>(null);
  
  const handleOpenResourceModal = (resource: any = null) => {
    setEditingResource(resource);
    setIsResourceModalOpen(true);
  };
  
  const handleCloseResourceModal = () => {
    setIsResourceModalOpen(false);
    setEditingResource(null);
  };
  
  const handleOpenAllocationModal = (resource: any) => {
    setAllocatingResource(resource);
    setIsAllocationModalOpen(true);
  };
  
  const handleCloseAllocationModal = () => {
    setIsAllocationModalOpen(false);
    setAllocatingResource(null);
  };
  
  const handleOpenReleaseModal = (resource: any) => {
    setReleasingResource(resource);
    setIsReleaseModalOpen(true);
  };
  
  const handleCloseReleaseModal = () => {
    setIsReleaseModalOpen(false);
    setReleasingResource(null);
  };
  
  const handleDeleteResource = async (id: string) => {
    if (confirm('确定要删除此资源吗？')) {
      try {
        await deleteResource(id);
      } catch (error) {
        console.error('删除资源错误:', error);
      }
    }
  };
  
  // Find user allocation for a specific resource
  const findUserAllocation = (resourceId: string) => {
    return allocations.find(allocation => allocation.resourceId === resourceId);
  };
  
  // Check if all authenticated
  const isAuthenticated = status === 'authenticated';
  
  return (
    <div>
      {/* Resources Section */}
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-2xl font-bold">资源管理</h1>
        
        {isAuthenticated && (
          <button
            onClick={() => handleOpenResourceModal()}
            className="flex items-center gap-2 bg-blue-500 hover:bg-blue-600 text-white py-2 px-4 rounded-md transition duration-200"
          >
            <FiPlus /> 添加资源
          </button>
        )}
      </div>
      
      {/* Loading state */}
      {loading && (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-blue-500"></div>
        </div>
      )}
      
      {/* Authentication required message */}
      {!isAuthenticated && !loading && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 text-center my-8">
          <FiUser className="mx-auto mb-3 text-blue-500" size={36} />
          <h3 className="text-xl font-medium text-blue-800 mb-2">需要登录</h3>
          <p className="text-blue-600 mb-4">
            请登录或注册账号以管理和分配资源
          </p>
          <div className="flex justify-center gap-4">
            <Link
              href="/login"
              className="bg-blue-500 hover:bg-blue-600 text-white py-2 px-6 rounded-md transition duration-200"
            >
              登录
            </Link>
            <Link
              href="/register"
              className="bg-white hover:bg-gray-50 text-blue-500 border border-blue-500 py-2 px-6 rounded-md transition duration-200"
            >
              注册
            </Link>
          </div>
        </div>
      )}
      
      {/* Resources List */}
      {!loading && resources.length === 0 && isAuthenticated && (
        <div className="text-center py-12 bg-gray-50 rounded-lg border border-gray-200">
          <h3 className="text-xl font-medium text-gray-700 mb-2">暂无资源</h3>
          <p className="text-gray-500 mb-4">
            点击"添加资源"按钮开始创建资源
          </p>
        </div>
      )}
      
      {resources.length > 0 && (
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <AnimatePresence>
            {resources.map((resource) => {
              const userAllocation = findUserAllocation(resource.id);
              const isAllocated = !!userAllocation && userAllocation.amount > 0;
              
              // Calculate the percentage of used resources
              const usagePercentage = Math.min(
                100,
                Math.round(((resource.totalAmount - resource.remainingAmount) / resource.totalAmount) * 100)
              );
              
              return (
                <motion.div
                  key={resource.id}
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -20 }}
                  className="bg-white rounded-lg shadow-md overflow-hidden"
                >
                  <div className="p-5">
                    <div className="flex justify-between items-start mb-3">
                      <h3 className="text-lg font-bold">{resource.name}</h3>
                      
                      {isAuthenticated && (
                        <div className="flex gap-2">
                          <button
                            onClick={() => handleOpenResourceModal(resource)}
                            className="p-1.5 text-gray-600 hover:bg-gray-100 rounded-full transition-colors"
                          >
                            <FiEdit2 size={16} />
                          </button>
                          
                          <button
                            onClick={() => handleDeleteResource(resource.id)}
                            className="p-1.5 text-red-500 hover:bg-red-50 rounded-full transition-colors"
                            disabled={loading}
                          >
                            <FiTrash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    
                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span className="text-gray-600">
                          可用: {resource.remainingAmount} / {resource.totalAmount}
                        </span>
                        <span className={resource.remainingAmount === 0 ? 'text-red-500' : 'text-green-500'}>
                          {resource.remainingAmount === 0 
                            ? <FiAlertCircle className="inline mr-1" /> 
                            : <FiCheckCircle className="inline mr-1" />
                          }
                          {resource.remainingAmount === 0 ? '已用尽' : '可用'}
                        </span>
                      </div>
                      
                      <div className="w-full bg-gray-200 rounded-full h-2.5">
                        <div 
                          className={`h-2.5 rounded-full ${usagePercentage >= 90 ? 'bg-red-500' : 'bg-blue-500'}`}
                          style={{ width: `${usagePercentage}%` }}
                        ></div>
                      </div>
                    </div>
                    
                    {isAuthenticated && (
                      <div className="flex justify-between items-center">
                        {isAllocated ? (
                          <div className="flex items-center text-sm text-gray-600">
                            <span>
                              您已占用: <span className="font-medium text-blue-600">{userAllocation.amount}</span>
                            </span>
                          </div>
                        ) : (
                          <div className="text-sm text-gray-500">您尚未占用此资源</div>
                        )}
                        
                        <div className="flex gap-2">
                          {resource.remainingAmount > 0 && (
                            <button
                              onClick={() => handleOpenAllocationModal(resource)}
                              className="flex items-center gap-1 py-1.5 px-3 rounded-md text-sm bg-blue-500 hover:bg-blue-600 text-white"
                              disabled={loading}
                            >
                              <FiLink size={14} /> 占用
                            </button>
                          )}
                          
                          {isAllocated && (
                            <button
                              onClick={() => handleOpenReleaseModal(resource)}
                              className="flex items-center gap-1 py-1.5 px-3 rounded-md text-sm bg-red-100 hover:bg-red-200 text-red-700"
                              disabled={loading}
                            >
                              <FiTrash2 size={14} /> 释放
                            </button>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                </motion.div>
              );
            })}
          </AnimatePresence>
        </div>
      )}
      
      {/* Resource Modal */}
      {isResourceModalOpen && (
        <ResourceForm
          resource={editingResource}
          onClose={handleCloseResourceModal}
        />
      )}
      
      {/* Allocation Modal */}
      {isAllocationModalOpen && allocatingResource && (
        <AllocationForm
          resource={allocatingResource}
          onClose={handleCloseAllocationModal}
          currentAllocation={findUserAllocation(allocatingResource.id)}
        />
      )}
      
      {/* Release Modal */}
      {isReleaseModalOpen && releasingResource && (
        <ReleaseForm
          resource={releasingResource}
          onClose={handleCloseReleaseModal}
          currentAllocation={findUserAllocation(releasingResource.id)}
        />
      )}
    </div>
  );
}
