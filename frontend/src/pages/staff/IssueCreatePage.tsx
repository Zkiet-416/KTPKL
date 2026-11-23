import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import { getProductPrice, productsApi, type ProductRecord } from '@/api/products.api';
import { goodsIssuesApi } from '@/api/goodsIssues.api';

interface IssueLineForm {
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

export default function IssueCreatePage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [loadingProducts, setLoadingProducts] = useState(true);

  const [code, setCode] = useState(() => `PX-${Date.now().toString().slice(-6)}`);
  const [note, setNote] = useState('');
  const [lines, setLines] = useState<IssueLineForm[]>([
    { rowId: 1, productId: '', quantity: '1', unitPrice: '0' },
  ]);

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const loadProducts = async () => {
    setLoadingProducts(true);
    try {
      const res = await productsApi.getProducts({ page: 1, limit: 100 });
      setProducts(res.data);
      if (res.data.length > 0) {
        const first = res.data[0];
        setLines((prev) =>
          prev.map((l, idx) =>
            idx === 0 && !l.productId
              ? { ...l, productId: String(first.id), unitPrice: String(getProductPrice(first)) }
              : l,
          ),
        );
      }
    } catch (err) {
      setError(extractErrorMessage(err, 'Không thể tải danh sách sản phẩm.'));
    } finally {
      setLoadingProducts(false);
    }
  };

  useEffect(() => {
    loadProducts();
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
    const first = products[0];
    setLines((prev) => [
      ...prev,
      {
        rowId: Date.now() + Math.random(),
        productId: first ? String(first.id) : '',
        quantity: '1',
        unitPrice: first ? String(getProductPrice(first)) : '0',
      },
    ]);
  };

  const removeLine = (rowId: number) => {
    setLines((prev) => (prev.length <= 1 ? prev : prev.filter((l) => l.rowId !== rowId)));
  };

  const handleProductChange = (rowId: number, newProdId: string) => {
    const prod = productMap.get(Number(newProdId));
    setLines((prev) =>
      prev.map((item) =>
        item.rowId === rowId
          ? {
              ...item,
              productId: newProdId,
              unitPrice: prod ? String(getProductPrice(prod)) : item.unitPrice,
            }
          : item,
      ),
    );
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setSuccessMsg(null);

    const trimmedCode = code.trim();
    if (!trimmedCode) {
      setError('Vui lòng nhập mã phiếu xuất.');
      return;
    }

    const parsedDetails: { productId: number; quantity: number; unitPrice: number }[] = [];

    for (const l of lines) {
      const pid = Number(l.productId);
      const qty = Number(l.quantity);
      const price = Number(l.unitPrice);

      if (
        !Number.isInteger(pid) ||
        pid < 1 ||
        !Number.isInteger(qty) ||
        qty < 1 ||
        Number.isNaN(price) ||
        price < 0
      ) {
        setError('Vui lòng chọn sản phẩm, số lượng xuất (≥ 1) và đơn giá hợp lệ.');
        return;
      }

      const prod = productMap.get(pid);
      if (prod && qty > Number(prod.stockQuantity ?? 0)) {
        setError(
          `Sản phẩm "${prod.name}" (${prod.code}) chỉ còn tồn ${prod.stockQuantity}, không thể xuất ${qty}.`,
        );
        return;
      }

      parsedDetails.push({ productId: pid, quantity: qty, unitPrice: price });
    }

    setSubmitting(true);
    try {
      await goodsIssuesApi.createIssue({
        code: trimmedCode,
        issueType: 'XUAT',
        note: note.trim() || undefined,
        details: parsedDetails,
      });

      setSuccessMsg(`Đã lưu phiếu xuất "${trimmedCode}" và cập nhật giảm tồn kho.`);
      setCode(`PX-${Date.now().toString().slice(-6)}`);
      setNote('');
      await loadProducts();
    } catch (err) {
      setError(extractErrorMessage(err, 'Không thể lưu phiếu xuất kho.'));
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-slate-800">Lập phiếu xuất kho</h1>
        <p className="text-sm text-slate-500">
          Chọn sản phẩm và số lượng xuất (không vượt quá tồn kho hiện tại) để giảm tồn kho
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
        <div className="grid grid-cols-1 gap-4 rounded-xl border border-slate-200 bg-white p-5 shadow-xs md:grid-cols-2">
          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Mã phiếu xuất *</label>
            <input
              type="text"
              required
              value={code}
              onChange={(e) => setCode(e.target.value)}
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>

          <div>
            <label className="mb-1 block text-xs font-medium text-slate-700">Ghi chú</label>
            <input
              type="text"
              value={note}
              onChange={(e) => setNote(e.target.value)}
              placeholder="Lý do / ghi chú xuất kho..."
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
          <div className="flex items-center justify-between border-b border-slate-200 bg-slate-50 px-5 py-3">
            <h2 className="text-sm font-bold text-slate-800">Chi tiết sản phẩm xuất</h2>
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
                  <th className="px-4 py-2.5 text-right">Tồn khả dụng</th>
                  <th className="px-4 py-2.5 text-right">Số lượng xuất</th>
                  <th className="px-4 py-2.5 text-right">Đơn giá (₫)</th>
                  <th className="px-4 py-2.5 text-right">Thành tiền</th>
                  <th className="px-4 py-2.5 text-right">Xóa</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {lines.map((line) => {
                  const prod = productMap.get(Number(line.productId));
                  const stock = Number(prod?.stockQuantity ?? 0);
                  const qty = Number(line.quantity) || 0;
                  const price = Number(line.unitPrice) || 0;
                  const overStock = prod ? qty > stock : false;
                  const lineTotal = qty > 0 && price >= 0 ? qty * price : 0;

                  return (
                    <tr key={line.rowId}>
                      <td className="px-4 py-2.5">
                        <select
                          value={line.productId}
                          onChange={(e) => handleProductChange(line.rowId, e.target.value)}
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
                      <td className="px-4 py-2.5 text-right text-xs font-semibold text-slate-700">
                        {prod ? `${stock} ${prod.unit || 'cái'}` : '—'}
                      </td>
                      <td className="px-4 py-2.5 text-right">
                        <input
                          type="number"
                          min={1}
                          max={prod ? Math.max(1, stock) : undefined}
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
                          className={`w-24 rounded-md border px-2.5 py-1.5 text-right text-sm ${
                            overStock ? 'border-rose-500 bg-rose-50' : 'border-slate-300'
                          }`}
                        />
                        {overStock && (
                          <div className="mt-0.5 text-[11px] text-rose-600">Vượt tồn ({stock})</div>
                        )}
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
              Tổng giá trị phiếu xuất:{' '}
              <span className="text-emerald-700">{formatCurrency(totalAmount)}</span>
            </div>

            <button
              type="submit"
              disabled={submitting || loadingProducts}
              className="rounded-md bg-emerald-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:opacity-60"
            >
              {submitting ? 'Đang lưu phiếu...' : 'Lưu phiếu xuất kho'}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}