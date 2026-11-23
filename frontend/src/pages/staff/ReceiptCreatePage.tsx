import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { productsApi, type ProductRecord } from '@/api/products.api';
import { suppliersApi, type SupplierRecord } from '@/api/suppliers.api';
import { goodsIssuesApi } from '@/api/goodsIssues.api';

interface ReceiptLineForm {
  rowId: number;
  productId: string;
  quantity: string;
  unitPrice: string;
}

function formatCurrency(val: number): string {
  if (Number.isNaN(val)) return '0 ₫';
  return `${val.toLocaleString('vi-VN')} ₫`;
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

export default function ReceiptCreatePage() {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loadingData, setLoadingData] = useState(true);

  const [code, setCode] = useState(() => `PN-${Date.now().toString().slice(-6)}`);
  const [supplierId, setSupplierId] = useState('');
  const [note, setNote] = useState('');
  const [lines, setLines] = useState<ReceiptLineForm[]>([
    { rowId: 1, productId: '', quantity: '1', unitPrice: '0' },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadMasterData = async () => {
    setLoadingData(true);
    setError(null);

    const [supResult, prodResult] = await Promise.allSettled([
      suppliersApi.getSuppliers({ page: 1, limit: 100 }),
      productsApi.getProducts({ page: 1, limit: 100 }),
    ]);

    if (supResult.status === 'fulfilled') {
      const supList = supResult.value.data;
      setSuppliers(supList);
      if (supList.length > 0 && !supplierId) {
        setSupplierId(String(supList[0].id));
      }
    } else {
      // Nếu role Staff bị 403 trên /suppliers thì bỏ qua êm ái, không chặn trang lập phiếu
      const status = axios.isAxiosError(supResult.reason)
        ? supResult.reason.response?.status
        : undefined;
      if (status && status !== 403) {
        setError(extractErrorMessage(supResult.reason, 'Không thể tải danh sách nhà cung cấp.'));
      }
    }

    if (prodResult.status === 'fulfilled') {
      const prodList = prodResult.value.data;
      setProducts(prodList);
      if (prodList.length > 0) {
        setLines((prev) =>
          prev.map((l, idx) =>
            idx === 0 && !l.productId ? { ...l, productId: String(prodList[0].id) } : l,
          ),
        );
      }
    } else {
      setError(extractErrorMessage(prodResult.reason, 'Không thể tải danh sách sản phẩm.'));
    }

    setLoadingData(false);
  };

  useEffect(() => {
    loadMasterData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const productMap = useMemo(() => {
    const map = new Map<number, ProductRecord>();
    for (const p of products) {
      map.set(p.id, p);
    }
    return map;
  }, [products]);

  const totalAmount = useMemo(() => {
    return lines.reduce((sum, line) => {
      const qty = Number(line.quantity);
      const price = Number(line.unitPrice);
      if (Number.isNaN(qty) || Number.isNaN(price) || qty <= 0 || price < 0) return sum;
      return sum + qty * price;
    }, 0);
  }, [lines]);

  const addLine = () => {
    const defaultProdId = products[0]?.id ? String(products[0].id) : '';
    setLines((prev) => [
      ...prev,
      { rowId: Date.now() + Math.random(), productId: defaultProdId, quantity: '1', unitPrice: '0' },
    ]);
  };

  const removeLine = (rowId: number) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.rowId !== rowId)));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError('Vui lòng nhập mã phiếu nhập.');
      return;
    }

    const parsedDetails = lines.map((l) => ({
      productId: Number(l.productId),
      quantity: Number(l.quantity),
      unitPrice: Number(l.unitPrice),
    }));

    if (
      parsedDetails.length === 0 ||
      parsedDetails.some(
        (d) =>
          !Number.isInteger(d.productId) ||
          d.productId < 1 ||
          !Number.isInteger(d.quantity) ||
          d.quantity < 1 ||
          Number.isNaN(d.unitPrice) ||
          d.unitPrice < 0,
      )
    ) {
      setError('Vui lòng chọn sản phẩm, số lượng (≥ 1) và đơn giá nhập hợp lệ cho từng dòng.');
      return;
    }

    const selectedSupplier = suppliers.find((s) => String(s.id) === supplierId);
    const combinedNote = [
      selectedSupplier ? `NCC: ${selectedSupplier.name}` : '',
      note.trim(),
    ]
      .filter(Boolean)
      .join(' | ');

    setSubmitting(true);
    try {
      await goodsIssuesApi.createIssue({
        code: trimmedCode,
        issueType: 'NHAP',
        note: combinedNote || undefined,
        details: parsedDetails,
      });

      setSuccessMsg(`Đã lưu phiếu nhập "${trimmedCode}" và cập nhật tăng tồn kho.`);
      setCode(`PN-${Date.now().toString().slice(-6)}`);
      setNote('');
      await loadMasterData();
    } catch (err) {
      setError(extractErrorMessage(err, 'Không thể lưu phiếu nhập kho.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Lập phiếu nhập kho</h1>
        <p className="text-sm text-slate-500">
          Chọn nhà cung cấp, thêm dòng sản phẩm, số lượng và đơn giá nhập để tăng tồn kho
        </p>
      </div>

      {successMsg && (
        <div className="rounded-lg border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800">
          {successMsg}
        </div>
      )}

      {error && (
        <div className="rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">
          {error}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-5">
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs md:grid-cols-3">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Mã phiếu nhập *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Nhà cung cấp</label>
            <select
              value={supplierId}
              onChange={(e) => setSupplierId(e.target.value)}
              disabled={loadingData}
              className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm"
            >
              {suppliers.length === 0 ? (
                <option value="">Mặc định (theo hệ thống)</option>
              ) : (
                suppliers.map((s) => (
                  <option key={s.id} value={String(s.id)}>
                    {s.name}
                  </option>
                ))
              )}
            </select>
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Ghi chú</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Ghi chú đợt nhập..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
            <h2 className="text-sm font-bold text-slate-800">Chi tiết sản phẩm nhập</h2>
            <button
              type="button"
              onClick={addLine}
              className="rounded-md border border-emerald-600 bg-emerald-50 px-3 py-1.5 text-xs font-semibold text-emerald-700 hover:bg-emerald-100"
            >
              + Thêm dòng SP
            </button>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead className="border-b border-slate-200 bg-slate-50/60 text-xs uppercase text-slate-500">
                <tr>
                  <th className="px-4 py-2.5">Sản phẩm</th>
                  <th className="px-4 py-2.5 text-right">Tồn hiện tại</th>
                  <th className="px-4 py-2.5 text-right">Số lượng nhập</th>
                  <th className="px-4 py-2.5 text-right">Đơn giá nhập (₫)</th>
                  <th className="px-4 py-2.5 text-right">Thành tiền</th>
                  <th className="px-4 py-2.5 text-right">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.map((line) => {
                  const prod = productMap.get(Number(line.productId));
                  const qty = Number(line.quantity) || 0;
                  const price = Number(line.unitPrice) || 0;
                  const lineTotal = qty > 0 && price >= 0 ? qty * price : 0;

                  return (
                    <tr key={line.rowId}>
                      <td className="px-4 py-2.5">
                        <select
                          value={line.productId}
                          onChange={(e) =>
                            setLines((prev) =>
                              prev.map((item) =>
                                item.rowId === line.rowId
                                  ? { ...item, productId: e.target.value }
                                  : item,
                              ),
                            )
                          }
                          className="w-full min-w-[220px] rounded-md border border-slate-300 bg-white px-2.5 py-1.5 text-sm"
                        >
                          <option value="">-- Chọn sản phẩm --</option>
                          {products.map((p) => (
                            <option key={p.id} value={String(p.id)}>
                              {p.code} - {p.name}
                            </option>
                          ))}
                        </select>
                      </td>
                      <td className="px-4 py-2.5 text-right text-xs font-semibold text-slate-600">
                        {prod ? `${prod.stockQuantity} ${prod.unit || 'cái'}` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <input
                          type="number"
                          min={1}
                          step={1}
                          value={line.quantity}
                          onChange={(e) =>
                            setLines((prev) =>
                              prev.map((item) =>
                                item.rowId === line.rowId
                                  ? { ...item, quantity: e.target.value }
                                  : item,
                              ),
                            )
                          }
                          className="w-24 rounded-md border border-slate-300 px-2.5 py-1.5 text-right text-sm"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <input
                          type="number"
                          min={0}
                          step="1"
                          value={line.unitPrice}
                          onChange={(e) =>
                            setLines((prev) =>
                              prev.map((item) =>
                                item.rowId === line.rowId
                                  ? { ...item, unitPrice: e.target.value }
                                  : item,
                              ),
                            )
                          }
                          className="w-32 rounded-md border border-slate-300 px-2.5 py-1.5 text-right text-sm"
                        />
                      </td>
                      <td className="px-4 py-2.5 text-right font-semibold text-slate-800">
                        {formatCurrency(lineTotal)}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <button
                          type="button"
                          disabled={lines.length <= 1}
                          onClick={() => removeLine(line.rowId)}
                          className="rounded border border-rose-200 px-2 py-1 text-xs text-rose-600 hover:bg-rose-50 disabled:opacity-40"
                        >
                          Xóa
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 bg-slate-50 px-5 py-4">
            <div className="text-sm font-bold text-slate-800">
              Tổng tiền phiếu nhập:{' '}
              <span className="text-emerald-700">{formatCurrency(totalAmount)}</span>
            </div>

            <button
              type="submit"
              disabled={submitting || loadingData}
              className="rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {submitting ? 'Đang lưu phiếu...' : 'Lưu phiếu nhập kho'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}