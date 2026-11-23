import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  getProductPrice,
  getStoredCategories,
  productsApi,
  type CategoryOption,
  type ProductRecord,
} from '@/api/products.api';

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

function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export default function ProductLookupPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [categories] = useState<CategoryOption[]>(() => getStoredCategories());

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [minPrice, setMinPrice] = useState('');
  const [maxPrice, setMaxPrice] = useState('');

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const catNum = categoryId ? Number(categoryId) : undefined;
      const res = await productsApi.getProducts({
        page: 1,
        limit: 100,
        search: debouncedSearch,
        categoryId: catNum && catNum > 0 ? catNum : undefined,
      });
      setProducts(res.data);
    } catch (err) {
      setError(extractErrorMessage(err, 'Không thể tải danh sách hàng hóa.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedSearch, categoryId]);

  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of categories) {
      map.set(c.id, c.name);
    }
    return map;
  }, [categories]);

  const filteredProducts = useMemo(() => {
    const minVal = minPrice.trim() !== '' ? Number(minPrice) : null;
    const maxVal = maxPrice.trim() !== '' ? Number(maxPrice) : null;

    return products.filter((item) => {
      const price = getProductPrice(item);
      if (minVal !== null && !Number.isNaN(minVal) && price < minVal) return false;
      if (maxVal !== null && !Number.isNaN(maxVal) && price > maxVal) return false;
      return true;
    });
  }, [products, minPrice, maxPrice]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Tra cứu hàng hóa</h1>
          <p className="text-sm text-slate-500">
            Xem tồn kho, tìm kiếm theo tên/mã và lọc theo loại hoặc khoảng giá bán
          </p>
        </div>

        <button
          type="button"
          onClick={loadProducts}
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

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs md:grid-cols-5">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Tên hoặc mã SP</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Nhập tên sản phẩm hoặc mã SP..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Loại sản phẩm</label>
          <select
            value={categoryId}
            onChange={(e) => setCategoryId(e.target.value)}
            className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm"
          >
            <option value="">Tất cả loại</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name} (#{cat.id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Giá từ (₫)</label>
          <input
            type="number"
            min={0}
            value={minPrice}
            onChange={(e) => setMinPrice(e.target.value)}
            placeholder="0"
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Giá đến (₫)</label>
          <div className="flex gap-2">
            <input
              type="number"
              min={0}
              value={maxPrice}
              onChange={(e) => setMaxPrice(e.target.value)}
              placeholder="Không giới hạn"
              className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
            />
            <button
              type="button"
              onClick={() => {
                setSearch('');
                setCategoryId('');
                setMinPrice('');
                setMaxPrice('');
              }}
              className="shrink-0 rounded-md border border-slate-200 px-2.5 py-2 text-xs text-slate-600 hover:bg-slate-50"
            >
              Xóa lọc
            </button>
          </div>
        </div>
      </div>

      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">Mã SP</th>
                <th className="px-4 py-3">Tên sản phẩm</th>
                <th className="px-4 py-3">Loại</th>
                <th className="px-4 py-3">ĐVT</th>
                <th className="px-4 py-3 text-right">Giá bán</th>
                <th className="px-4 py-3 text-right">Tồn kho</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    Đang tải danh sách hàng hóa...
                  </td>
                </tr>
              ) : filteredProducts.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    Không tìm thấy hàng hóa phù hợp.
                  </td>
                </tr>
              ) : (
                filteredProducts.map((p) => {
                  const stock = Number(p.stockQuantity ?? 0);
                  const catName = p.category?.name || categoryMap.get(p.categoryId);
                  return (
                    <tr key={p.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">
                        {p.code}
                      </td>
                      <td className="px-4 py-3 font-medium text-slate-800">{p.name}</td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {catName ? `${catName} (#${p.categoryId})` : `Loại #${p.categoryId}`}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">{p.unit || 'cái'}</td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">
                        {formatCurrency(getProductPrice(p))}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span
                          className={`inline-flex rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                            stock <= 0
                              ? 'bg-rose-100 text-rose-700'
                              : stock <= 10
                                ? 'bg-amber-100 text-amber-800'
                                : 'bg-emerald-100 text-emerald-700'
                          }`}
                        >
                          {formatNumber(stock)}
                        </span>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}