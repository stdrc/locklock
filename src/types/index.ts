// 通用类型定义
export interface User {
  id: string;
  email: string;
  createdAt: string;
  updatedAt: string;
}

export interface Resource {
  id: string;
  name: string;
  totalAmount: number;
  remainingAmount: number;
  createdAt: string;
  updatedAt: string;
}

export interface Allocation {
  id: string;
  amount: number;
  userId: string;
  resourceId: string;
  resource: Resource;
  createdAt: string;
  updatedAt: string;
}

// API 响应类型
export interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  message?: string;
}

export interface AuthSignInResponse {
  success: boolean;
  ok?: boolean;
  error?: string;
  url?: string;
}

export interface AuthCredentials {
  email: string;
  password: string;
}

// 表单 Props 类型
export interface ResourceFormProps {
  resource: Resource | null;
  onClose: () => void;
}

export interface AllocationFormProps {
  resource: Resource;
  currentAllocation: Allocation | null;
  onClose: () => void;
}

export interface ReleaseFormProps {
  resource: Resource;
  currentAllocation: Allocation;
  onClose: () => void;
}

// Context 类型
export interface AuthContextType {
  user: User | null;
  status: 'loading' | 'authenticated' | 'unauthenticated';
  signIn: (credentials: { email: string; password: string }) => Promise<AuthSignInResponse>;
  signOut: () => Promise<void>;
  register: (credentials: { email: string; password: string }) => Promise<AuthSignInResponse>;
}

export interface ResourceContextType {
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
