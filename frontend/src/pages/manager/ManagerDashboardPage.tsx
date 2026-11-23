import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  dashboardApi,
  type ProductItem,
  type ReceiptDetailResponse,
  type ReceiptItem,
} from '@/api/dashboard.api';

function formatNumber(val: number | string | undefined | null): string {
  const num = Number(val ?? 0);
  if (Number.isNaN(num)) return '0';
  return num.toLocaleString('vi-VN');
}

function formatCurrency(val: number | string | undefined | null): string {
  const num = Number(val ?? 0);
  if (Number.isNaN(num)) return '0 ₫';
  return `${num.toLocaleString('vi-VN')} ₫`;
}

function formatDateTime(iso: string | undefined): string {
  if (!iso) return '—';
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return iso;
  return d.toLocaleString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

export default function ManagerDashboardPage() {
  const [products, setProducts] = useState<ProductItem[]>([]);
  const [totalProductsCount, setTotalProductsCount] = useState(0);
  const [receipts, setReceipts] = useState<ReceiptItem[]>([]);
  const [lowStockThreshold, setLowStockThreshold] = useState<number>(10);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedReceipt, setSelectedReceipt] = useState<ReceiptDetailResponse | null>(null);
  const [loadingDetail, setLoadingDetail] = useState(false);

  const loadDashboard = async () => {
    setLoading(true);
    setError(null);
    try {
      const [prodRes, recRes] = await Promise.all([
        dashboardApi.getAllProducts(),
        dashboardApi.getRecentReceipts(6),
      ]);
      setProducts(prodRes.items);
      setTotalProductsCount(prodRes.total);
      setReceipts(recRes);
    } catch (err) {
      const message =
        err instanceof Error ? err.message : 'Không thể tải dữ liệu tổng quan từ máy chủ.';
      setError(message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboard();
  }, []);

  const totalStock = useMemo(
    () => products.reduce((sum, item) => sum + Number(item.stockQuantity ?? 0), 0),
    [products],
  );

  const lowStockProducts = useMemo(
    () =>
      products
        .filter((item) => Number(item.stockQuantity ?? 0) <= lowStockThreshold)
        .sort((a, b) => Number(a.stockQuantity ?? 0) - Number(b.stockQuantity ?? 0)),
    [products, lowStockThreshold],
  );

  const recentTotalAmount = useMemo(
    () => receipts.reduce((sum, r) => sum + Number(r.totalAmount ?? 0), 0),
    [receipts],
  );

  const handleOpenReceiptDetail = async (id: number) => {
    setLoadingDetail(true);
    setSelectedReceipt(null);
    try {
      const detail = await dashboardApi.getReceiptDetail(id);
      setSelectedReceipt(detail);
    } catch {
      setSelectedReceipt(null);
    } finally {
      setLoadingDetail(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tổng quan (Quản lý kho)</h1>
          <p className="text-sm text-slate-500">
            Theo dõi nhanh tồn kho, cảnh báo sắp hết hàng và phiếu nhập gần đây
          </p>
        </div>

        <div className="flex items-center gap-2.5">
          <label className="flex items-center gap-2 rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs text-slate-700">
            <span>Ngưỡng cảnh báo ≤</span>
            <input
              type="number"
              min={0}
              value={lowStockThreshold}
              onChange={(e) => setLowStockThreshold(Math.max(0, Number(e.target.value) || 0))}
              className="w-14 rounded border border-slate-200 px-1.5 py-0.5 text-right font-semibold text-slate-800"
            />
          </label>

          <button
            type="button"
            onClick={loadDashboard}
            disabled={loading}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
          >
            {loading ? 'Đang tải...' : 'Làm mới'}
          </button>
        </div>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* 4 Thẻ thống kê */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Tổng số sản phẩm
          </div>
          <div className="mt-2 text-3xl font-bold text-slate-800">
            {loading ? '—' : formatNumber(totalProductsCount)}
          </div>
          <div className="mt-1 text-xs text-slate-400">Sản phẩm đang kinh doanh</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Tổng tồn kho
          </div>
          <div className="mt-2 text-3xl font-bold text-blue-700">
            {loading ? '—' : formatNumber(totalStock)}
          </div>
          <div className="mt-1 text-xs text-slate-400">Tổng số lượng hiện có trong kho</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Cảnh báo sắp hết hàng
          </div>
          <div className="mt-2 text-3xl font-bold text-amber-600">
            {loading ? '—' : formatNumber(lowStockProducts.length)}
          </div>
          <div className="mt-1 text-xs text-slate-400">Tồn kho ≤ {lowStockThreshold} sản phẩm</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-medium uppercase tracking-wide text-slate-500">
            Giá trị phiếu nhập gần đây
          </div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {loading ? '—' : formatCurrency(recentTotalAmount)}
          </div>
          <div className="mt-1 text-xs text-slate-400">
            Tính trên {receipts.length} phiếu nhập mới nhất
          </div>
        </div>
      </div>

      {/* 2 Khối chính: Cảnh báo sắp hết hàng & Phiếu nhập gần đây */}
      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        {/* Cảnh báo sắp hết hàng */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Cảnh báo sắp hết hàng</h2>
              <p className="text-xs text-slate-500">
                Các mặt hàng có số lượng tồn ≤ {lowStockThreshold}
              </p>
            </div>
            <Link
              to="/manager/products"
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              Xem sản phẩm →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Mã SP</th>
                  <th className="px-4 py-3">Tên sản phẩm</th>
                  <th className="px-4 py-3 text-right">Tồn kho</th>
                  <th className="px-4 py-3 text-center">Mức cảnh báo</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                      Đang tải dữ liệu tồn kho...
                    </td>
                  </tr>
                ) : lowStockProducts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      Không có sản phẩm nào dưới ngưỡng {lowStockThreshold}.
                    </td>
                  </tr>
                ) : (
                  lowStockProducts.map((item) => {
                    const qty = Number(item.stockQuantity ?? 0);
                    const isOut = qty <= 0;
                    return (
                      <tr key={item.id} className="hover:bg-slate-50/80">
                        <td className="px-4 py-3 font-mono text-xs text-slate-600">
                          {item.code || `#${item.id}`}
                        </td>
                        <td className="px-4 py-3 font-medium text-slate-800">{item.name}</td>
                        <td className="px-4 py-3 text-right font-semibold text-slate-800">
                          {formatNumber(qty)}
                        </td>
                        <td className="px-4 py-3 text-center">
                          {isOut ? (
                            <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-700">
                              Hết hàng
                            </span>
                          ) : (
                            <span className="inline-flex rounded-full bg-amber-100 px-2.5 py-0.5 text-xs font-medium text-amber-800">
                              Sắp hết
                            </span>
                          )}
                        </td>
                      </tr>
                    );
                  })
                )}
              </tbody>
            </table>
          </div>
        </div>

        {/* Phiếu nhập gần đây */}
        <div className="rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-100 px-5 py-4">
            <div>
              <h2 className="text-base font-bold text-slate-800">Phiếu nhập gần đây</h2>
              <p className="text-xs text-slate-500">Bấm vào mã phiếu để xem chi tiết</p>
            </div>
            <Link
              to="/manager/receipts"
              className="text-xs font-semibold text-blue-700 hover:underline"
            >
              Tất cả phiếu →
            </Link>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-3">Mã phiếu</th>
                  <th className="px-4 py-3">Nhà cung cấp</th>
                  <th className="px-4 py-3">Ngày nhập</th>
                  <th className="px-4 py-3 text-right">Tổng tiền</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {loading ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                      Đang tải phiếu nhập...
                    </td>
                  </tr>
                ) : receipts.length === 0 ? (
                  <tr>
                    <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                      Chưa có phiếu nhập nào.
                    </td>
                  </tr>
                ) : (
                  receipts.map((receipt) => (
                    <tr
                      key={receipt.id}
                      onClick={() => handleOpenReceiptDetail(receipt.id)}
                      className="cursor-pointer hover:bg-blue-50/50"
                    >
                      <td className="px-4 py-3 font-semibold text-blue-700">
                        {receipt.receiptCode}
                      </td>
                      <td className="px-4 py-3 text-slate-700">
                        {receipt.supplier?.name || '—'}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-500">
                        {formatDateTime(receipt.createdAt)}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">
                        {formatCurrency(receipt.totalAmount)}
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      {/* Modal xem nhanh chi tiết phiếu nhập */}
      {(loadingDetail || selectedReceipt) && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-2xl rounded-xl bg-white p-6 shadow-xl">
            {loadingDetail || !selectedReceipt ? (
              <div className="py-8 text-center text-sm text-slate-500">
                Đang tải chi tiết phiếu nhập...
              </div>
            ) : (
              <>
                <div className="flex items-start justify-between border-b border-slate-100 pb-4">
                  <div>
                    <h3 className="text-lg font-bold text-slate-800">
                      Chi tiết phiếu nhập: {selectedReceipt.receiptCode}
                    </h3>
                    <p className="text-xs text-slate-500">
                      NCC: {selectedReceipt.supplier?.name || '—'} · Người tạo:{' '}
                      {selectedReceipt.createdBy?.fullName || '—'} · Ngày:{' '}
                      {formatDateTime(selectedReceipt.createdAt)}
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => setSelectedReceipt(null)}
                    className="rounded-md border border-slate-300 px-3 py-1 text-xs font-medium text-slate-600 hover:bg-slate-50"
                  >
                    Đóng
                  </button>
                </div>

                <div className="mt-4 overflow-x-auto">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-100 bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-3 py-2">Mã SP</th>
                        <th className="px-3 py-2">Sản phẩm</th>
                        <th className="px-3 py-2 text-right">SL</th>
                        <th className="px-3 py-2 text-right">Đơn giá</th>
                        <th className="px-3 py-2 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {selectedReceipt.details?.map((d, idx) => (
                        <tr key={`${d.id}-${idx}`}>
                          <td className="px-3 py-2 font-mono text-xs text-slate-600">{d.code}</td>
                          <td className="px-3 py-2 text-slate-800">{d.name}</td>
                          <td className="px-3 py-2 text-right">{formatNumber(d.quantity)}</td>
                          <td className="px-3 py-2 text-right">{formatCurrency(d.unitPrice)}</td>
                          <td className="px-3 py-2 text-right font-medium">
                            {formatCurrency(d.lineTotal)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4 text-sm">
                  <span className="text-slate-500">
                    Ghi chú: {selectedReceipt.note || 'Không có'}
                  </span>
                  <span className="text-base font-bold text-blue-700">
                    Tổng cộng: {formatCurrency(selectedReceipt.totalAmount)}
                  </span>
                </div>
              </>
            )}
          </div>
        </div>
      )}
    </div>
  );
}