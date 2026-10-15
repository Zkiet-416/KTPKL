/** Vai trò người dùng - phải khớp với backend/src/common/enums/role.enum.ts */
export const Role = {
  ADMIN: 'ADMIN',
  WAREHOUSE_MANAGER: 'WAREHOUSE_MANAGER',
  WAREHOUSE_STAFF: 'WAREHOUSE_STAFF',
} as const;

export type Role = (typeof Role)[keyof typeof Role];

export const ROLE_LABEL: Record<Role, string> = {
  ADMIN: 'Quản trị hệ thống',
  WAREHOUSE_MANAGER: 'Quản lý kho',
  WAREHOUSE_STAFF: 'Nhân viên kho',
};
