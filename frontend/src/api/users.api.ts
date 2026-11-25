import { http } from '@/api/client';
import { Role } from '@/types/role';
import type { CreateUserPayload, UpdateUserPayload, User } from '@/types/user';

const ROLE_ID_TO_ROLE: Record<number, Role> = {
  1: Role.ADMIN,
  2: Role.WAREHOUSE_MANAGER,
  3: Role.WAREHOUSE_STAFF,
};

export const ROLE_TO_ROLE_ID: Record<Role, number> = {
  [Role.ADMIN]: 1,
  [Role.WAREHOUSE_MANAGER]: 2,
  [Role.WAREHOUSE_STAFF]: 3,
};

function resolveRole(raw: Record<string, unknown>): Role {
  const roleObj = raw.Role as Record<string, unknown> | undefined;
  const directRole = raw.role ?? roleObj?.Code ?? roleObj?.code;
  if (typeof directRole === 'string' && directRole in ROLE_TO_ROLE_ID) {
    return directRole as Role;
  }

  const rawRoleId = Number(raw.roleId ?? raw.RoleId ?? roleObj?.Id ?? 0);
  if (rawRoleId in ROLE_ID_TO_ROLE) {
    return ROLE_ID_TO_ROLE[rawRoleId];
  }

  return Role.WAREHOUSE_STAFF;
}

function normalizeUser(raw: Record<string, unknown>): User {
  const role = resolveRole(raw);
  const parsedRoleId = Number(raw.roleId ?? raw.RoleId ?? ROLE_TO_ROLE_ID[role]);

  return {
    id: (raw.id ?? raw.Id ?? raw._id ?? '') as number | string,
    username: String(raw.username ?? raw.Username ?? raw.email ?? ''),
    email: raw.email ?? raw.Email ? String(raw.email ?? raw.Email) : undefined,
    phone: raw.phone ?? raw.Phone ? String(raw.phone ?? raw.Phone) : undefined,
    fullName: String(raw.fullName ?? raw.FullName ?? raw.full_name ?? raw.name ?? ''),
    role,
    roleId: Number.isFinite(parsedRoleId) && parsedRoleId > 0 ? parsedRoleId : ROLE_TO_ROLE_ID[role],
    isActive:
      typeof raw.isActive === 'boolean'
        ? raw.isActive
        : typeof raw.IsActive === 'boolean'
          ? raw.IsActive
          : raw.status !== 'LOCKED',
    createdAt: raw.createdAt ? String(raw.createdAt) : undefined,
  };
}

function extractErrorMessage(err: unknown, fallback: string): string {
  const axiosErr = err as { response?: { data?: { message?: string | string[] } }; message?: string };
  const msg = axiosErr?.response?.data?.message;
  if (Array.isArray(msg)) return msg.join(', ');
  if (typeof msg === 'string' && msg.trim()) return msg;
  return axiosErr?.message || fallback;
}

export const usersApi = {
  async getAll(): Promise<User[]> {
    const res = await http.get('/users');
    const rawList = Array.isArray(res.data)
      ? res.data
      : Array.isArray(res.data?.data)
        ? res.data.data
        : [];
    return rawList
      .map((item: Record<string, unknown>) => normalizeUser(item))
      .filter((u: User) => u.role !== Role.ADMIN);
  },

  async create(payload: CreateUserPayload): Promise<User> {
    const safeRoleId = payload.roleId === 1 ? 3 : Number(payload.roleId);
    const body: CreateUserPayload = {
      username: payload.username,
      password: payload.password,
      fullName: payload.fullName,
      roleId: safeRoleId,
      ...(payload.email ? { email: payload.email } : {}),
      ...(payload.phone ? { phone: payload.phone } : {}),
    };
    const res = await http.post('/users', body);
    const data = res.data?.data ?? res.data;
    return normalizeUser(data as Record<string, unknown>);
  },

  async update(id: number | string, payload: UpdateUserPayload): Promise<User> {
    const body: Record<string, unknown> = {};
    if (payload.fullName !== undefined) body.fullName = payload.fullName;
    if (payload.email !== undefined) body.email = payload.email;
    if (payload.phone !== undefined) body.phone = payload.phone;
    if (payload.password !== undefined) body.password = payload.password;
    if (payload.roleId !== undefined && payload.roleId !== 1) {
      body.roleId = Number(payload.roleId);
    }
    if (payload.isActive !== undefined) body.isActive = payload.isActive;

    const res = await http.put(`/users/${id}`, body);
    const data = res.data?.data ?? res.data;
    return normalizeUser(data as Record<string, unknown>);
  },

  async updateRole(id: number | string, roleId: number): Promise<User> {
    const safeRoleId = roleId === 1 ? 3 : Number(roleId);
    const res = await http.patch(`/users/${id}/role`, { roleId: safeRoleId });
    const data = res.data?.data ?? res.data;
    return normalizeUser(data as Record<string, unknown>);
  },

  getErrorMessage: extractErrorMessage,
};