import type { Role } from '@/types/role';

export interface User {
  id: number | string;
  username: string;
  email?: string;
  phone?: string;
  fullName: string;
  role: Role;
  roleId?: number;
  isActive: boolean;
  createdAt?: string;
}

export interface CreateUserPayload {
  username: string;
  password: string;
  fullName: string;
  email?: string;
  phone?: string;
  roleId: number;
}

export interface UpdateUserPayload {
  fullName?: string;
  email?: string;
  phone?: string;
  password?: string;
  roleId?: number;
  isActive?: boolean;
}