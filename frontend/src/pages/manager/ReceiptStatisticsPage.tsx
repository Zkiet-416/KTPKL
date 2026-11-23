import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  goodsReceiptsApi,
  type GoodsReceiptDetailResponse,
  type GoodsReceiptHistoryResponse,
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

export default function GoodsReceiptStatisticsPage() {
  const [month, setMonth] = useState<string>('11');
  const [year, setYear] = useState<string>('2026');

  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(5);

  const [history, setHistory] = useState<GoodsReceiptHistoryResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [selectedReceipt, setSelectedReceipt] = useState<GoodsReceiptDetailResponse | null>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);

  const loadHistory = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await goodsReceiptsApi.getHistory({
        month: month ? Number(month) : undefined,
        year: year ? Number(year) : undefined,
      });
      setHistory(res);
    } catch (err) {
      setError(extractErrorMessage(err, 'Không thể tải thống kê nhập kho.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    setPage(1);
    loadHistory();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [month, year]);

  const receipts = history?.receipts ?? [];
  const totalReceipts = Number(history?.totalReceipts ?? receipts.length);
  const totalAmount = Number(history?.totalAmount ?? 0);

  const totalPages = Math.max(1, Math.ceil(receipts.length / pageSize));
  const safePage = Math.min(page, totalPages);

  const paginatedReceipts = useMemo(() => {
    const start = (safePage - 1) * pageSize;
    return receipts.slice(start, start + pageSize);
  }, [receipts, safePage, pageSize]);

  const totalQuantity = useMemo(() => {
    let sum = 0;
    for (const r of receipts) {
      for (const d of r.details ?? []) {
        sum += Number(d.quantity ?? 0);
      }
    }
    return sum;
  }, [receipts]);

  const avgAmount = totalReceipts > 0 ? totalAmount / totalReceipts : 0;

  const supplierStats = useMemo(() => {
    const map = new Map<
      string,
      { key: string; name: string; receiptCount: number; amount: number }
    >();

    for (const r of receipts) {
      const supplierName = r.supplier?.name?.trim() || 'Không rõ NCC';
      const key = `${r.supplier?.id ?? 0}-${supplierName}`;
      const current = map.get(key) ?? {
        key,
        name: supplierName,
        receiptCount: 0,
        amount: 0,
      };
      current.receiptCount += 1;
      current.amount += Number(r.totalAmount ?? 0);
      map.set(key, current);
    }

    return Array.from(map.values()).sort((a, b) => b.amount - a.amount);
  }, [receipts]);

  const periodLabel = useMemo(() => {
    if (month && year) return `Tháng ${month}/${year}`;
    if (month) return `Tháng ${month} (tất cả năm)`;
    if (year) return `Năm ${year}`;
    return 'Tất cả thời gian';
  }, [month, year]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Thống kê nhập kho</h1>
          <p className="text-sm text-slate-500">
            Tổng hợp số lượng phiếu nhập, giá trị nhập và phân bổ theo nhà cung cấp ({periodLabel})
          </p>
        </div>

        <button
          type="button"
          onClick={loadHistory}
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

      {/* Bộ lọc tháng / năm */}
      <div className="flex flex-wrap items-end gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs">
        <div className="w-44">
          <label className="mb-1 block text-xs font-medium text-slate-600">Tháng</label>
          <select
            value={month}
            onChange={(e) => setMonth(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
          >
            <option value="">Tất cả tháng</option>
            {Array.from({ length: 12 }, (_, idx) => idx + 1).map((m) => (
              <option key={m} value={String(m)}>
                Tháng {m}
              </option>
            ))}
          </select>
        </div>

        <div className="w-40">
          <label className="mb-1 block text-xs font-medium text-slate-600">Năm</label>
          <input
            type="number"
            min={1900}
            max={9999}
            value={year}
            onChange={(e) => setYear(e.target.value)}
            placeholder="Tất cả năm"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <button
          type="button"
          onClick={() => {
            setMonth('');
            setYear('');
          }}
          className="rounded-md border border-slate-300 bg-slate-50 px-3.5 py-2 text-xs font-medium text-slate-700 hover:bg-slate-100"
        >
          Xem tất cả thời gian
        </button>
      </div>

      {/* 4 Thẻ KPI */}
      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-400">Tổng phiếu nhập</div>
          <div className="mt-2 text-2xl font-bold text-slate-800">
            {loading ? '—' : formatNumber(totalReceipts)}
          </div>
          <div className="mt-1 text-xs text-slate-500">Kỳ: {periodLabel}</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-400">Tổng giá trị nhập</div>
          <div className="mt-2 text-2xl font-bold text-blue-700">
            {loading ? '—' : formatCurrency(totalAmount)}
          </div>
          <div className="mt-1 text-xs text-slate-500">Tổng tiền các phiếu trong kỳ</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-400">Tổng SL sản phẩm</div>
          <div className="mt-2 text-2xl font-bold text-emerald-700">
            {loading ? '—' : formatNumber(totalQuantity)}
          </div>
          <div className="mt-1 text-xs text-slate-500">Cộng dồn từ chi tiết phiếu</div>
        </div>

        <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-xs">
          <div className="text-xs font-semibold uppercase text-slate-400">Trung bình / phiếu</div>
          <div className="mt-2 text-2xl font-bold text-slate-800">
            {loading ? '—' : formatCurrency(avgAmount)}
          </div>
          <div className="mt-1 text-xs text-slate-500">Giá trị bình quân mỗi lần nhập</div>
        </div>
      </div>

      {/* Thống kê theo nhà cung cấp */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-800">Thống kê theo nhà cung cấp</h2>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/60 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Nhà cung cấp</th>
                <th className="px-4 py-2.5 text-right">Số phiếu nhập</th>
                <th className="px-4 py-2.5 text-right">Tổng tiền nhập</th>
                <th className="px-4 py-2.5 text-right">Tỷ trọng</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-400">
                    Đang tổng hợp dữ liệu...
                  </td>
                </tr>
              ) : supplierStats.length === 0 ? (
                <tr>
                  <td colSpan={4} className="px-4 py-8 text-center text-slate-500">
                    Chưa có dữ liệu nhập kho cho khoảng thời gian này.
                  </td>
                </tr>
              ) : (
                supplierStats.map((row) => {
                  const pct = totalAmount > 0 ? ((row.amount / totalAmount) * 100).toFixed(1) : '0.0';
                  return (
                    <tr key={row.key} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-medium text-slate-800">{row.name}</td>
                      <td className="px-4 py-3 text-right text-xs font-semibold text-slate-700">
                        {formatNumber(row.receiptCount)}
                      </td>
                      <td className="px-4 py-3 text-right font-semibold text-slate-800">
                        {formatCurrency(row.amount)}
                      </td>
                      <td className="px-4 py-3 text-right text-xs font-medium text-blue-700">
                        {pct}%
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Danh sách phiếu nhập trong kỳ (có phân trang) */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="flex flex-wrap items-center justify-between gap-2 border-b border-slate-200 bg-slate-50 px-4 py-3">
          <h2 className="text-sm font-bold text-slate-800">
            Danh sách phiếu nhập trong kỳ ({receipts.length})
          </h2>

          <div className="flex items-center gap-2 text-xs text-slate-600">
            <span>Hiển thị:</span>
            <select
              value={pageSize}
              onChange={(e) => {
                setPageSize(Number(e.target.value));
                setPage(1);
              }}
              className="rounded border border-slate-300 bg-white px-2 py-1 text-xs text-slate-800"
            >
              <option value={5}>5 dòng</option>
              <option value={10}>10 dòng</option>
              <option value={20}>20 dòng</option>
            </select>
          </div>
        </div>

        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50/60 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-2.5">Mã phiếu</th>
                <th className="px-4 py-2.5">Nhà cung cấp</th>
                <th className="px-4 py-2.5">Người lập</th>
                <th className="px-4 py-2.5">Ngày nhập</th>
                <th className="px-4 py-2.5 text-right">Tổng tiền</th>
                <th className="px-4 py-2.5 text-right">Chi tiết</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-400">
                    Đang tải danh sách phiếu nhập...
                  </td>
                </tr>
              ) : paginatedReceipts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                    Không có phiếu nhập nào trong kỳ này.
                  </td>
                </tr>
              ) : (
                paginatedReceipts.map((receipt) => (
                  <tr key={receipt.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-blue-700">
                      {receipt.receiptCode}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">
                      {receipt.supplier?.name || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {receipt.createdBy?.fullName || '—'}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {formatDateTime(receipt.createdAt)}
                    </td>
                    <td className="px-4 py-3 text-right font-semibold text-slate-800">
                      {formatCurrency(receipt.totalAmount)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <button
                        type="button"
                        onClick={() => {
                          setSelectedReceipt(receipt);
                          setShowDetailModal(true);
                        }}
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

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <div>
            Tổng cộng: <span className="font-semibold text-slate-800">{receipts.length}</span> phiếu ·
            Trang {safePage}/{totalPages}
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              disabled={safePage <= 1 || loading}
              onClick={() => setPage((p) => Math.max(1, p - 1))}
              className="rounded border border-slate-300 bg-white px-3 py-1 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            >
              Trước
            </button>
            <button
              type="button"
              disabled={safePage >= totalPages || loading}
              onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
              className="rounded border border-slate-300 bg-white px-3 py-1 font-medium text-slate-700 hover:bg-slate-100 disabled:opacity-40"
            >
              Sau
            </button>
          </div>
        </div>
      </div>

      {/* Modal chi tiết phiếu */}
      {showDetailModal && selectedReceipt && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h3 className="text-lg font-bold text-slate-800">
                  Phiếu nhập {selectedReceipt.receiptCode}
                </h3>
                <p className="text-xs text-slate-500">
                  NCC: {selectedReceipt.supplier?.name || '—'} · Ngày:{' '}
                  {formatDateTime(selectedReceipt.createdAt)}
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowDetailModal(false)}
                className="rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>

            <div className="mt-4 overflow-x-auto rounded-lg border border-slate-200">
              <table className="w-full text-left text-sm">
                <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
                  <tr>
                    <th className="px-3 py-2">Mã SP</th>
                    <th className="px-3 py-2">Tên sản phẩm</th>
                    <th className="px-3 py-2 text-right">SL</th>
                    <th className="px-3 py-2 text-right">Đơn giá</th>
                    <th className="px-3 py-2 text-right">Thành tiền</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {(selectedReceipt.details ?? []).map((d, idx) => (
                    <tr key={`${d.id}-${idx}`}>
                      <td className="px-3 py-2 font-mono text-xs">{d.code || `#${d.id}`}</td>
                      <td className="px-3 py-2 text-slate-800">{d.name}</td>
                      <td className="px-3 py-2 text-right text-xs">{formatNumber(d.quantity)}</td>
                      <td className="px-3 py-2 text-right text-xs">{formatCurrency(d.unitPrice)}</td>
                      <td className="px-3 py-2 text-right text-xs font-semibold">
                        {formatCurrency(d.lineTotal)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>

            <div className="mt-4 text-right text-sm font-bold text-blue-700">
              Tổng tiền phiếu: {formatCurrency(selectedReceipt.totalAmount)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}