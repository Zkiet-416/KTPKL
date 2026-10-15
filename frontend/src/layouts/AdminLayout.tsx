import PortalLayout from '@/components/layout/PortalLayout';

export default function AdminLayout() {
  return (
    <PortalLayout
      title="ADMIN"
      subtitle="Quản trị hệ thống"
      headerClass="bg-slate-800"
      navItems={[
        { to: '/admin', label: 'Tổng quan', end: true },
        { to: '/admin/users', label: 'Quản lý người dùng' },
      ]}
    />
  );
}
