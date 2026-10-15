/** Vai trò người dùng trong hệ thống (khớp với bảng Roles trong CSDL & FE: src/types/role.ts) */
export enum Role {
  ADMIN = 'ADMIN', // Quản trị hệ thống: quản lý user, phân quyền
  WAREHOUSE_MANAGER = 'WAREHOUSE_MANAGER', // Quản lý kho (B4)
  WAREHOUSE_STAFF = 'WAREHOUSE_STAFF', // Nhân viên kho (B3)
}
