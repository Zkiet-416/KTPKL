import PlaceholderPage from '@/components/PlaceholderPage';

export default function IssueCreatePage() {
  return (
    <PlaceholderPage
      title="Lập phiếu xuất kho"
      owner="TV5"
      features={[
        'Chọn sản phẩm và số lượng xuất (không vượt quá tồn)',
        'Lưu phiếu: số lượng tồn kho GIẢM đi',
      ]}
    />
  );
}
