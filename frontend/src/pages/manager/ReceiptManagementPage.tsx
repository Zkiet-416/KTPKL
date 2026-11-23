import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  goodsReceiptsApi,
  type GoodsReceiptDetailResponse,
  type GoodsReceiptSummary,
} from '@/api/goodsReceipts.api';

function formatCurrency(val: number | string | undefined | null): string {
  const num = Number(val ?? 0);
  if (Number.isNaN(num)) return '0 ₫';
  return `${num.toLocaleString('vi-VN')} ₫`;
}

function formatNumber(val: number | string | undefined | null): string {
  const num = Number(val ?? 0);
  if (Number.isNaN(num)) return '0';
  return num.toLocaleString('vi-VN');
}

function formatDateTime(iso: string | undefined | null): string {
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

function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export default function GoodsReceiptManagementPage() {
  const [receipts, setReceipts] = useState<GoodsReceiptSummary[]>([]);
  const [total, setTotal] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [month, setMonth] = useState<string>('');
  const [year, setYear] = useState<string>('');
  const [sortBy, setSortBy] = useState<'createdAt' | 'receiptCode' | 'totalAmount'>('createdAt');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('DESC');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedReceipt, setSelectedReceipt] = useState<GoodsReceiptDetailResponse | null>(null);
  const [detailLoading, setDetailLoading] = useState(false);
  const [detailError, setDetailError] = useState<string | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadReceipts = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await goodsReceiptsApi.getReceipts({
        page,
        limit,
        search: debouncedSearch,
        month: month ? Number(month) : undefined,
        year: year ? Number(year) : undefined,
        sortBy,
        order,
      });
      setReceipts(res.data);
      setTotal(res.total);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(extractErrorMessage(err, 'Không thể tải danh sách phiếu nhập kho.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadReceipts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearch, month, year, sortBy, order]);

  const openReceiptDetail = async (id: number) => {
    setShowDetailModal(true);
    setDetailLoading(true);
    setDetailError(null);
    setSelectedReceipt(null);

    try {
      const data = await goodsReceiptsApi.getReceiptPrintData(id);
      setSelectedReceipt(data);
    } catch {
      try {
        const fallbackData = await goodsReceiptsApi.getReceiptById(id);
        setSelectedReceipt(fallbackData);
      } catch (err) {
        setDetailError(extractErrorMessage(err, 'Không thể tải chi tiết phiếu nhập.'));
      }
    } finally {
      setDetailLoading(false);
    }
  };

  const handleResetFilters = () => {
    setSearch('');
    setDebouncedSearch('');
    setMonth('');
    setYear('');
    setSortBy('createdAt');
    setOrder('DESC');
    setPage(1);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Phiếu nhập kho</h1>
          <p className="text-sm text-slate-500">
            Tra cứu phiếu nhập kho theo mã phiếu/NCC/thời gian, sắp xếp và xem chi tiết sản phẩm nhập
          </p>
        </div>

        <button
          type="button"
          onClick={loadReceipts}
          className="rounded-md border border-slate-300 bg-white px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
        >
          Làm mới
        </button>
      </div>

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      {/* Bộ lọc tìm kiếm, tháng/năm & sắp xếp */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs md:grid-cols-6">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Tìm kiếm</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Mã phiếu (PN001) hoặc tên NCC..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Tháng</label>
          <select
            value={month}
            onChange={(e) => {
              setMonth(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
          >
            <option value="">Tất cả tháng</option>
            {Array.from({ length: 12 }, (_, idx) => idx + 1).map((m) => (
              <option key={m} value={String(m)}>
                Tháng {m}
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Năm</label>
          <input
            type="number"
            min={1900}
            max={9999}
            value={year}
            onChange={(e) => {
              setYear(e.target.value);
              setPage(1);
            }}
            placeholder="VD: 2026"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Sắp xếp</label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'createdAt' | 'receiptCode' | 'totalAmount');
                setPage(1);
              }}
              className="flex-1 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="createdAt">Ngày nhập</option>
              <option value="receiptCode">Mã phiếu</option>
              <option value="totalAmount">Tổng tiền</option>
            </select>

            <button
              type="button"
              onClick={() => {
                setOrder((prev) => (prev === 'ASC' ? 'DESC' : 'ASC'));
                setPage(1);
              }}
              title={order === 'ASC' ? 'Đang tăng dần' : 'Đang giảm dần'}
              className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              {order === 'ASC' ? '↑ Tăng' : '↓ Giảm'}
            </button>

            <button
              type="button"
              onClick={handleResetFilters}
              className="rounded-md border border-slate-200 px-2.5 py-2 text-xs font-medium text-slate-600 hover:bg-slate-50"
            >
              Đặt lại
            </button>
          </div>
        </div>
      </div>

      {/* Bảng danh sách phiếu nhập */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Mã phiếu</th>
                <th className="px-4 py-3">Nhà cung cấp</th>
                <th className="px-4 py-3">Người lập</th>
                <th className="px-4 py-3">Ngày nhập</th>
                <th className="px-4 py-3 text-right">Tổng tiền</th>
                <th className="px-4 py-3">Ghi chú</th>
                <th className="px-4 py-3 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Đang tải danh sách phiếu nhập kho...
                  </td>
                </tr>
              ) : receipts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    Không có phiếu nhập kho nào phù hợp.
                  </td>
                </tr>
              ) : (
                receipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">
                      <button
                        type="button"
                        onClick={() => openReceiptDetail(receipt.id)}
                        className="hover:underline"
                      >
                        {receipt.receiptCode}
                      </button>
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {receipt.supplier?.name || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {receipt.createdBy?.fullName || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {formatDateTime(receipt.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      {formatCurrency(receipt.totalAmount)}
                    </td>
                    <td className="max-w-[220px] truncate px-4 py-3 text-xs text-slate-500">
                      {receipt.note || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => openReceiptDetail(receipt.id)}
                        className="rounded border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Xem
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Phân trang */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <div>
            Tổng cộng: <span className="font-semibold text-slate-800">{total}</span> phiếu nhập ·
            Trang {page}/{totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={page <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border border-slate-300 bg-white px-3 py-1 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            >
              Trước
            </button>
            <button
              type="button"
              disabled={page >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded border border-slate-300 bg-white px-3 py-1 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modal Chi tiết phiếu nhập */}
      {showDetailModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-3xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">
                  {selectedReceipt
                    ? `Chi tiết phiếu nhập ${selectedReceipt.receiptCode}`
                    : 'Chi tiết phiếu nhập'}
                </h2>
                {selectedReceipt && (
                  <p className="text-xs text-slate-500">
                    Ngày lập: {formatDateTime(selectedReceipt.createdAt)} · Người tạo:{' '}
                    {selectedReceipt.createdBy?.fullName || '—'}
                    {selectedReceipt.createdBy?.username
                      ? ` (${selectedReceipt.createdBy.username})`
                      : ''}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2">
                {selectedReceipt && (
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="rounded-md border border-slate-300 bg-white px-3 py-1.5 text-xs font-medium text-slate-700 hover:bg-slate-50"
                  >
                    In phiếu
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => setShowDetailModal(false)}
                  className="rounded-md border border-slate-300 px-3 py-1.5 text-xs text-slate-600 hover:bg-slate-50"
                >
                  Đóng
                </button>
              </div>
            </div>

            {detailLoading ? (
              <div className="py-10 text-center text-sm text-slate-400">
                Đang tải chi tiết phiếu nhập...
              </div>
            ) : detailError ? (
              <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
                {detailError}
              </div>
            ) : selectedReceipt ? (
              <div className="mt-4 space-y-5">
                {/* Thông tin nhà cung cấp & ghi chú */}
                <div className="grid grid-cols-1 gap-3 rounded-lg border border-slate-200 bg-slate-50/70 p-4 text-xs sm:grid-cols-2">
                  <div>
                    <div className="font-semibold text-slate-500">NHÀ CUNG CẤP</div>
                    <div className="mt-1 text-sm font-bold text-slate-800">
                      {selectedReceipt.supplier?.name || '—'}
                    </div>
                    {selectedReceipt.supplier?.contactName && (
                      <div className="text-slate-600">
                        Liên hệ: {selectedReceipt.supplier.contactName}
                      </div>
                    )}
                    {selectedReceipt.supplier?.phone && (
                      <div className="text-slate-600">SĐT: {selectedReceipt.supplier.phone}</div>
                    )}
                    {selectedReceipt.supplier?.email && (
                      <div className="text-slate-600">Email: {selectedReceipt.supplier.email}</div>
                    )}
                    {selectedReceipt.supplier?.address && (
                      <div className="text-slate-600">
                        Địa chỉ: {selectedReceipt.supplier.address}
                      </div>
                    )}
                  </div>

                  <div>
                    <div className="font-semibold text-slate-500">THÔNG TIN PHIẾU</div>
                    <div className="mt-1 text-slate-700">
                      Mã phiếu:{' '}
                      <span className="font-mono font-semibold">{selectedReceipt.receiptCode}</span>
                    </div>
                    <div className="mt-1 text-slate-700">
                      Ghi chú: {selectedReceipt.note || <span className="text-slate-400">Không có</span>}
                    </div>
                    <div className="mt-2 text-sm font-bold text-blue-700">
                      Tổng tiền: {formatCurrency(selectedReceipt.totalAmount)}
                    </div>
                  </div>
                </div>

                {/* Danh sách sản phẩm trong phiếu */}
                <div className="overflow-x-auto rounded-lg border border-slate-200">
                  <table className="w-full text-left text-sm">
                    <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                      <tr>
                        <th className="px-3 py-2.5">Mã SP</th>
                        <th className="px-3 py-2.5">Tên sản phẩm</th>
                        <th className="px-3 py-2.5">ĐVT</th>
                        <th className="px-3 py-2.5 text-right">Số lượng</th>
                        <th className="px-3 py-2.5 text-right">Đơn giá nhập</th>
                        <th className="px-3 py-2.5 text-right">Thành tiền</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                      {(selectedReceipt.details ?? []).length === 0 ? (
                        <tr>
                          <td colSpan={6} className="px-3 py-6 text-center text-xs text-slate-400">
                            Không có chi tiết sản phẩm.
                          </td>
                        </tr>
                      ) : (
                        selectedReceipt.details.map((item, idx) => (
                          <tr key={`${item.id}-${idx}`}>
                            <td className="px-3 py-2.5 font-mono text-xs font-semibold text-slate-700">
                              {item.code || `#${item.id}`}
                            </td>
                            <td className="px-3 py-2.5 font-medium text-slate-800">{item.name}</td>
                            <td className="px-3 py-2.5 text-xs text-slate-600">{item.unit}</td>
                            <td className="px-3 py-2.5 text-right text-xs font-semibold text-slate-800">
                              {formatNumber(item.quantity)}
                            </td>
                            <td className="px-3 py-2.5 text-right text-xs text-slate-700">
                              {formatCurrency(item.unitPrice)}
                            </td>
                            <td className="px-3 py-2.5 text-right text-xs font-semibold text-slate-800">
                              {formatCurrency(item.lineTotal)}
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : null}
          </div>
        </div>
      )}
    </div>
  );
}