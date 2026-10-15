import PortalLayout from '@/components/layout/PortalLayout';

export default function StaffLayout() {
  return (
    <PortalLayout
      title="NHÂN VIÊN KHO"
      subtitle="Cổng dành cho Nhân viên kho"
      headerClass="bg-emerald-700"
      navItems={[
        { to: '/staff', label: 'Tra cứu hàng hóa', end: true },
        { to: '/staff/receipts/new', label: 'Lập phiếu nhập kho' },
        { to: '/staff/issues/new', label: 'Lập phiếu xuất kho' },
      ]}
    />
  );
}
