import PlaceholderPage from '@/components/PlaceholderPage';

export default function AdminDashboardPage() {
  return (
    <PlaceholderPage
      title="Tổng quan hệ thống (Admin)"
      owner="TV1"
      features={[
        'Thống kê nhanh: số người dùng theo vai trò',
        'Lối tắt đến Quản lý người dùng',
      ]}
    />
  );
}
