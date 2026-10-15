import PortalLayout from '@/components/layout/PortalLayout';

export default function ManagerLayout() {
  return (
    <PortalLayout
      title="QUẢN LÝ KHO"
      subtitle="Cổng dành cho Quản lý kho"
      headerClass="bg-blue-700"
      navItems={[
        { to: '/manager', label: 'Tổng quan', end: true },
        { to: '/manager/products', label: 'Sản phẩm' },
        { to: '/manager/suppliers', label: 'Nhà cung cấp' },
        { to: '/manager/receipts', label: 'Phiếu nhập kho' },
        { to: '/manager/statistics', label: 'Thống kê nhập kho' },
      ]}
    />
  );
}
