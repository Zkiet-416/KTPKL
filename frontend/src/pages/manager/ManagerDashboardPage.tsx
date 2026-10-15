import PlaceholderPage from '@/components/PlaceholderPage';

export default function ManagerDashboardPage() {
  return (
    <PlaceholderPage
      title="Tổng quan (Quản lý kho)"
      owner="TV2"
      features={[
        'Tổng số sản phẩm, tổng tồn kho, cảnh báo sắp hết hàng',
        'Phiếu nhập gần đây',
      ]}
    />
  );
}
