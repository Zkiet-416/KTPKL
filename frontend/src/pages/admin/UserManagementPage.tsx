import PlaceholderPage from '@/components/PlaceholderPage';

export default function UserManagementPage() {
  return (
    <PlaceholderPage
      title="Quản lý người dùng"
      owner="TV1"
      features={[
        'Xem danh sách người dùng, tìm kiếm',
        'Thêm người dùng mới',
        'Sửa thông tin / đặt lại mật khẩu',
        'Xóa hoặc khóa tài khoản',
        'Phân quyền: ADMIN / Quản lý kho / Nhân viên kho',
      ]}
    />
  );
}
