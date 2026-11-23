import { useEffect, useMemo, useState } from 'react';
import axios from 'axios';
import {
  getProductPrice,
  getStoredCategories,
  productsApi,
  saveStoredCategories,
  type CategoryOption,
  type ProductPayload,
  type ProductRecord,
} from '@/api/products.api';

type SortField = 'code' | 'name' | 'categoryId' | 'sellingPrice' | 'stockQuantity';
type SortOrder = 'asc' | 'desc';

interface ProductFormState {
  code: string;
  name: string;
  categoryId: string;
  unit: string;
  sellingPrice: string;
  stockQuantity: string;
  description: string;
}

const EMPTY_FORM: ProductFormState = {
  code: '',
  name: '',
  categoryId: '1',
  unit: 'cái',
  sellingPrice: '',
  stockQuantity: '0',
  description: '',
};

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

export default function ProductManagementPage() {
  const [products, setProducts] = useState<ProductRecord[]>([]);
  const [total, setTotal] = useState(0);
  const [page, setPage] = useState(1);
  const [limit] = useState(20);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [filterCategoryId, setFilterCategoryId] = useState<string>('');
  const [sortBy, setSortBy] = useState<SortField>('name');
  const [sortOrder, setSortOrder] = useState<SortOrder>('asc');

  const [categories, setCategories] = useState<CategoryOption[]>(() => getStoredCategories());
  const [showCategoryModal, setShowCategoryModal] = useState(false);
  const [newCategoryId, setNewCategoryId] = useState('');
  const [newCategoryName, setNewCategoryName] = useState('');
  const [categoryError, setCategoryError] = useState<string | null>(null);

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState<ProductRecord | null>(null);
  const [form, setForm] = useState<ProductFormState>(EMPTY_FORM);
  const [formError, setFormError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const [deletingId, setDeletingId] = useState<number | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  useEffect(() => {
    const timer = window.setTimeout(() => {
      setDebouncedSearch(search);
      setPage(1);
    }, 250);
    return () => window.clearTimeout(timer);
  }, [search]);

  const categoryMap = useMemo(() => {
    const map = new Map<number, string>();
    for (const c of categories) {
      map.set(c.id, c.name);
    }
    for (const p of products) {
      if (p.category?.id && p.category?.name) {
        map.set(p.category.id, p.category.name);
      }
    }
    return map;
  }, [categories, products]);

  const getCategoryLabel = (product: ProductRecord) => {
    const name = product.category?.name || categoryMap.get(product.categoryId);
    return name ? `${name} (#${product.categoryId})` : `Loại #${product.categoryId}`;
  };

  const loadProducts = async () => {
    setLoading(true);
    setError(null);
    try {
      const catId = filterCategoryId ? Number(filterCategoryId) : undefined;
      const res = await productsApi.getProducts({
        page,
        limit,
        search: debouncedSearch,
        categoryId: catId && catId > 0 ? catId : undefined,
      });

      setCategories((prev) => {
        const existingIds = new Set(prev.map((x) => x.id));
        const extra: CategoryOption[] = [];
        for (const item of res.data) {
          if (item.categoryId && !existingIds.has(item.categoryId)) {
            existingIds.add(item.categoryId);
            extra.push({
              id: item.categoryId,
              name: item.category?.name || `Loại sản phẩm #${item.categoryId}`,
            });
          }
        }
        if (extra.length === 0) return prev;
        const merged = [...prev, ...extra].sort((a, b) => a.id - b.id);
        saveStoredCategories(merged);
        return merged;
      });

      setProducts(res.data);
      setTotal(res.total);
    } catch (err) {
      setError(extractErrorMessage(err, 'Không thể tải danh sách sản phẩm.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProducts();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearch, filterCategoryId]);

  const sortedProducts = useMemo(() => {
    const copy = [...products];
    copy.sort((a, b) => {
      let cmp = 0;
      if (sortBy === 'sellingPrice') {
        cmp = getProductPrice(a) - getProductPrice(b);
      } else if (sortBy === 'stockQuantity' || sortBy === 'categoryId') {
        cmp = Number(a[sortBy] ?? 0) - Number(b[sortBy] ?? 0);
      } else {
        const valA = String(a[sortBy] ?? '').toLowerCase();
        const valB = String(b[sortBy] ?? '').toLowerCase();
        cmp = valA.localeCompare(valB, 'vi');
      }
      return sortOrder === 'asc' ? cmp : -cmp;
    });
    return copy;
  }, [products, sortBy, sortOrder]);

  const totalPages = Math.max(1, Math.ceil(total / limit));

  const openCreateModal = () => {
    setEditingProduct(null);
    const defaultCat = filterCategoryId || String(categories[0]?.id ?? 1);
    setForm({
      ...EMPTY_FORM,
      categoryId: defaultCat,
    });
    setFormError(null);
    setShowFormModal(true);
  };

  const openEditModal = (product: ProductRecord) => {
    setEditingProduct(product);
    setForm({
      code: product.code || '',
      name: product.name || '',
      categoryId: String(product.categoryId ?? 1),
      unit: product.unit || 'cái',
      sellingPrice: String(getProductPrice(product)),
      stockQuantity: String(product.stockQuantity ?? 0),
      description: product.description ?? '',
    });
    setFormError(null);
    setShowFormModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    const code = form.code.trim();
    const name = form.name.trim();
    const categoryId = Number(form.categoryId);
    const unit = form.unit.trim() || 'cái';
    const salePrice = Number(form.sellingPrice);
    const stockQuantity = Number(form.stockQuantity);
    const description = form.description.trim() ? form.description.trim() : null;

    if (!code) {
      setFormError('Vui lòng nhập mã sản phẩm.');
      return;
    }
    if (code.length > 30) {
      setFormError('Mã sản phẩm tối đa 30 ký tự.');
      return;
    }
    if (!name) {
      setFormError('Vui lòng nhập tên sản phẩm.');
      return;
    }
    if (name.length > 200) {
      setFormError('Tên sản phẩm tối đa 200 ký tự.');
      return;
    }
    if (!Number.isInteger(categoryId) || categoryId < 1) {
      setFormError('Mã loại sản phẩm phải là số nguyên lớn hơn hoặc bằng 1.');
      return;
    }
    if (Number.isNaN(salePrice) || salePrice < 0.01) {
      setFormError('Giá bán phải lớn hơn 0.');
      return;
    }
    if (!Number.isInteger(stockQuantity) || stockQuantity < 0) {
      setFormError('Số lượng tồn kho phải là số nguyên không âm.');
      return;
    }
    if (description && description.length > 500) {
      setFormError('Mô tả tối đa 500 ký tự.');
      return;
    }

    const payload: ProductPayload = {
      code,
      name,
      categoryId,
      unit,
      salePrice,
      stockQuantity,
      description,
    };

    setSubmitting(true);
    try {
      if (editingProduct) {
        await productsApi.updateProduct(editingProduct.id, payload);
        setSuccessMsg(`Đã cập nhật sản phẩm "${name}" (${code}).`);
      } else {
        await productsApi.createProduct(payload);
        setSuccessMsg(`Đã thêm sản phẩm "${name}" (${code}).`);
      }
      setShowFormModal(false);
      await loadProducts();
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Không thể lưu sản phẩm.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteProduct = async (product: ProductRecord) => {
    const ok = window.confirm(`Xóa sản phẩm "${product.name}" (${product.code}) khỏi danh sách?`);
    if (!ok) return;

    setDeletingId(product.id);
    setError(null);
    setSuccessMsg(null);
    try {
      await productsApi.deleteProduct(product.id);
      setSuccessMsg(`Đã xóa sản phẩm "${product.name}".`);
      await loadProducts();
    } catch (err) {
      setError(extractErrorMessage(err, 'Không thể xóa sản phẩm.'));
    } finally {
      setDeletingId(null);
    }
  };

  const handleAddOrUpdateCategory = (e: React.FormEvent) => {
    e.preventDefault();
    setCategoryError(null);
    const id = Number(newCategoryId);
    const name = newCategoryName.trim();

    if (!Number.isInteger(id) || id < 1) {
      setCategoryError('ID loại sản phẩm phải là số nguyên ≥ 1.');
      return;
    }
    if (!name) {
      setCategoryError('Vui lòng nhập tên loại sản phẩm.');
      return;
    }

    setCategories((prev) => {
      const exists = prev.some((c) => c.id === id);
      const next = exists
        ? prev.map((c) => (c.id === id ? { id, name } : c))
        : [...prev, { id, name }].sort((a, b) => a.id - b.id);
      saveStoredCategories(next);
      return next;
    });

    setNewCategoryId('');
    setNewCategoryName('');
  };

  const handleDeleteCategory = (id: number) => {
    setCategories((prev) => {
      const next = prev.filter((c) => c.id !== id);
      saveStoredCategories(next);
      return next;
    });
    if (filterCategoryId === String(id)) {
      setFilterCategoryId('');
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý sản phẩm</h1>
          <p className="text-sm text-slate-500">
            Thêm, sửa, xóa sản phẩm, tìm kiếm, sắp xếp và quản lý loại sản phẩm
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2.5">
          <button
            type="button"
            onClick={() => {
              setCategoryError(null);
              setShowCategoryModal(true);
            }}
            className="rounded-md border border-slate-300 bg-white px-3.5 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
          >
            Loại sản phẩm ({categories.length})
          </button>

          <button
            type="button"
            onClick={openCreateModal}
            className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
          >
            + Thêm sản phẩm
          </button>
        </div>
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

      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs md:grid-cols-4">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Tìm kiếm</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã SP hoặc tên sản phẩm..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Loại sản phẩm</label>
          <select
            value={filterCategoryId}
            onChange={(e) => {
              setFilterCategoryId(e.target.value);
              setPage(1);
            }}
            className="w-full rounded-md border border-slate-300 bg-white px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
          >
            <option value="">Tất cả loại sản phẩm</option>
            {categories.map((cat) => (
              <option key={cat.id} value={String(cat.id)}>
                {cat.name} (#{cat.id})
              </option>
            ))}
          </select>
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Sắp xếp theo</label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortField)}
              className="flex-1 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="name">Tên sản phẩm</option>
              <option value="code">Mã sản phẩm</option>
              <option value="categoryId">Loại sản phẩm</option>
              <option value="sellingPrice">Giá bán</option>
              <option value="stockQuantity">Tồn kho</option>
            </select>

            <button
              type="button"
              onClick={() => setSortOrder((prev) => (prev === 'asc' ? 'desc' : 'asc'))}
              title={sortOrder === 'asc' ? 'Đang tăng dần' : 'Đang giảm dần'}
              className="rounded-md border border-slate-300 bg-slate-50 px-3 py-2 text-xs font-semibold text-slate-700 hover:bg-slate-100"
            >
              {sortOrder === 'asc' ? '↑ Tăng' : '↓ Giảm'}
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
                <th className="px-4 py-3">Loại sản phẩm</th>
                <th className="px-4 py-3">ĐVT</th>
                <th className="px-4 py-3 text-right">Giá bán</th>
                <th className="px-4 py-3 text-right">Tồn kho</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                    Đang tải danh sách sản phẩm...
                  </td>
                </tr>
              ) : sortedProducts.length === 0 ? (
                <tr>
                  <td colSpan={7} className="px-4 py-10 text-center text-slate-500">
                    Không tìm thấy sản phẩm phù hợp.
                  </td>
                </tr>
              ) : (
                sortedProducts.map((product) => {
                  const stock = Number(product.stockQuantity ?? 0);
                  const price = getProductPrice(product);
                  return (
                    <tr key={product.id} className="hover:bg-slate-50/80">
                      <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-700">
                        {product.code}
                      </td>
                      <td className="px-4 py-3">
                        <div className="font-medium text-slate-800">{product.name}</div>
                        {product.description && (
                          <div className="line-clamp-1 text-xs text-slate-400">
                            {product.description}
                          </div>
                        )}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {getCategoryLabel(product)}
                      </td>
                      <td className="px-4 py-3 text-xs text-slate-600">
                        {product.unit || 'cái'}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-slate-800">
                        {formatCurrency(price)}
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
                      <td className="px-4 py-3 text-right">
                        <div className="inline-flex items-center gap-2">
                          <button
                            type="button"
                            onClick={() => openEditModal(product)}
                            className="rounded border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                          >
                            Sửa
                          </button>
                          <button
                            type="button"
                            disabled={deletingId === product.id}
                            onClick={() => handleDeleteProduct(product)}
                            className="rounded border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                          >
                            {deletingId === product.id ? 'Đang xóa...' : 'Xóa'}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-slate-200 bg-slate-50 px-4 py-3 text-xs text-slate-600">
          <div>
            Tổng cộng: <span className="font-semibold text-slate-800">{total}</span> sản phẩm ·
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

      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-800">
                {editingProduct ? `Sửa sản phẩm (${editingProduct.code})` : 'Thêm sản phẩm mới'}
              </h2>
              <button
                type="button"
                onClick={() => setShowFormModal(false)}
                className="rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleSubmitForm} className="mt-4 space-y-4">
              {formError && (
                <div className="rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                  {formError}
                </div>
              )}

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Mã sản phẩm *
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    required
                    value={form.code}
                    onChange={(e) => setForm((f) => ({ ...f, code: e.target.value }))}
                    placeholder="VD: OL-IP15-01"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Đơn vị tính
                  </label>
                  <input
                    type="text"
                    maxLength={30}
                    value={form.unit}
                    onChange={(e) => setForm((f) => ({ ...f, unit: e.target.value }))}
                    placeholder="cái"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Tên sản phẩm *
                </label>
                <input
                  type="text"
                  maxLength={200}
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="VD: Ốp lưng iPhone 15"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-3">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Loại sản phẩm (ID) *
                  </label>
                  <select
                    value={form.categoryId}
                    onChange={(e) => setForm((f) => ({ ...f, categoryId: e.target.value }))}
                    className="w-full rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm"
                  >
                    {categories.map((cat) => (
                      <option key={cat.id} value={String(cat.id)}>
                        #{cat.id} - {cat.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Giá bán (₫) *
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    min="0.01"
                    required
                    value={form.sellingPrice}
                    onChange={(e) => setForm((f) => ({ ...f, sellingPrice: e.target.value }))}
                    placeholder="150000"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Tồn kho *
                  </label>
                  <input
                    type="number"
                    min="0"
                    step="1"
                    required
                    value={form.stockQuantity}
                    onChange={(e) => setForm((f) => ({ ...f, stockQuantity: e.target.value }))}
                    placeholder="0"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Mô tả</label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={form.description}
                  onChange={(e) => setForm((f) => ({ ...f, description: e.target.value }))}
                  placeholder="Mô tả ngắn về phụ kiện..."
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setShowFormModal(false)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm font-medium text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800 disabled:opacity-60"
                >
                  {submitting ? 'Đang lưu...' : editingProduct ? 'Lưu thay đổi' : 'Thêm sản phẩm'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {showCategoryModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <div>
                <h2 className="text-lg font-bold text-slate-800">Quản lý loại sản phẩm</h2>
                <p className="text-xs text-slate-500">
                  Thêm hoặc đặt tên cho mã loại (`categoryId`) để dùng khi tạo/lọc sản phẩm
                </p>
              </div>
              <button
                type="button"
                onClick={() => setShowCategoryModal(false)}
                className="rounded border border-slate-300 px-2.5 py-1 text-xs text-slate-600 hover:bg-slate-50"
              >
                Đóng
              </button>
            </div>

            <form onSubmit={handleAddOrUpdateCategory} className="mt-4 flex flex-wrap gap-2">
              <input
                type="number"
                min={1}
                value={newCategoryId}
                onChange={(e) => setNewCategoryId(e.target.value)}
                placeholder="ID (VD: 5)"
                className="w-24 rounded-md border border-slate-300 px-2.5 py-2 text-sm"
              />
              <input
                type="text"
                value={newCategoryName}
                onChange={(e) => setNewCategoryName(e.target.value)}
                placeholder="Tên loại sản phẩm..."
                className="min-w-[180px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm"
              />
              <button
                type="submit"
                className="rounded-md bg-blue-700 px-3.5 py-2 text-sm font-medium text-white hover:bg-blue-800"
              >
                Lưu loại
              </button>
            </form>

            {categoryError && (
              <div className="mt-2 rounded-md border border-rose-200 bg-rose-50 px-3 py-2 text-xs text-rose-700">
                {categoryError}
              </div>
            )}

            <div className="mt-4 max-h-64 divide-y divide-slate-100 overflow-y-auto rounded-lg border border-slate-200">
              {categories.map((cat) => (
                <div
                  key={cat.id}
                  className="flex items-center justify-between px-3.5 py-2.5 text-sm"
                >
                  <div>
                    <span className="font-mono text-xs font-semibold text-slate-500">
                      #{cat.id}
                    </span>{' '}
                    <span className="font-medium text-slate-800">{cat.name}</span>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setNewCategoryId(String(cat.id));
                        setNewCategoryName(cat.name);
                      }}
                      className="text-xs font-medium text-blue-700 hover:underline"
                    >
                      Sửa
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDeleteCategory(cat.id)}
                      className="text-xs font-medium text-rose-600 hover:underline"
                    >
                      Xóa
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}