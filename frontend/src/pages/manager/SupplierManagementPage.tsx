import { useEffect, useState } from 'react';
import axios from 'axios';
import {
  suppliersApi,
  type SupplierPayload,
  type SupplierRecord,
} from '@/api/suppliers.api';

interface SupplierFormState {
  name: string;
  phone: string;
  email: string;
  address: string;
}

const EMPTY_FORM: SupplierFormState = {
  name: '',
  phone: '',
  email: '',
  address: '',
};

const PHONE_REGEX = /^(0|\+84)[0-9]{9,10}$/;
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

function extractErrorMessage(err: unknown, fallback: string): string {
  if (axios.isAxiosError(err)) {
    const msg = err.response?.data?.message;
    if (Array.isArray(msg)) return msg.join(', ');
    if (typeof msg === 'string' && msg.trim()) return msg;
  }
  if (err instanceof Error && err.message) return err.message;
  return fallback;
}

export default function SupplierManagementPage() {
  const [suppliers, setSuppliers] = useState<SupplierRecord[]>([]);
  const [totalItems, setTotalItems] = useState(0);
  const [totalPages, setTotalPages] = useState(1);
  const [page, setPage] = useState(1);
  const [limit] = useState(10);

  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [sortBy, setSortBy] = useState<'id' | 'name'>('id');
  const [order, setOrder] = useState<'ASC' | 'DESC'>('ASC');

  const [showFormModal, setShowFormModal] = useState(false);
  const [editingSupplier, setEditingSupplier] = useState<SupplierRecord | null>(null);
  const [form, setForm] = useState<SupplierFormState>(EMPTY_FORM);
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

  const loadSuppliers = async () => {
    setLoading(true);
    setError(null);
    try {
      const res = await suppliersApi.getSuppliers({
        page,
        limit,
        search: debouncedSearch,
        sortBy,
        order,
      });
      setSuppliers(res.data);
      setTotalItems(res.totalItems);
      setTotalPages(res.totalPages);
    } catch (err) {
      setError(extractErrorMessage(err, 'Không thể tải danh sách nhà cung cấp.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadSuppliers();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [page, limit, debouncedSearch, sortBy, order]);

  const openCreateModal = () => {
    setEditingSupplier(null);
    setForm(EMPTY_FORM);
    setFormError(null);
    setShowFormModal(true);
  };

  const openEditModal = (supplier: SupplierRecord) => {
    setEditingSupplier(supplier);
    setForm({
      name: supplier.name || '',
      phone: supplier.phone || '',
      email: supplier.email || '',
      address: supplier.address || '',
    });
    setFormError(null);
    setShowFormModal(true);
  };

  const handleSubmitForm = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError(null);
    setSuccessMsg(null);

    const name = form.name.trim();
    const phone = form.phone.trim();
    const email = form.email.trim();
    const address = form.address.trim();

    if (!name) {
      setFormError('Tên nhà cung cấp không được để trống.');
      return;
    }
    if (name.length > 200) {
      setFormError('Tên nhà cung cấp tối đa 200 ký tự.');
      return;
    }
    if (phone && !PHONE_REGEX.test(phone)) {
      setFormError('Số điện thoại không đúng định dạng Việt Nam (VD: 0901234567 hoặc +84901234567).');
      return;
    }
    if (email && (email.length > 100 || !EMAIL_REGEX.test(email))) {
      setFormError('Email không hợp lệ hoặc vượt quá 100 ký tự.');
      return;
    }
    if (address.length > 500) {
      setFormError('Địa chỉ tối đa 500 ký tự.');
      return;
    }

    const payload: SupplierPayload = {
      name,
      ...(phone ? { phone } : {}),
      ...(email ? { email } : {}),
      ...(address ? { address } : {}),
    };

    setSubmitting(true);
    try {
      if (editingSupplier) {
        await suppliersApi.updateSupplier(editingSupplier.id, payload);
        setSuccessMsg(`Đã cập nhật nhà cung cấp "${name}".`);
      } else {
        await suppliersApi.createSupplier(payload);
        setSuccessMsg(`Đã thêm nhà cung cấp "${name}".`);
      }
      setShowFormModal(false);
      await loadSuppliers();
    } catch (err) {
      setFormError(extractErrorMessage(err, 'Không thể lưu nhà cung cấp.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleDeleteSupplier = async (supplier: SupplierRecord) => {
    const ok = window.confirm(`Xóa nhà cung cấp "${supplier.name}"?`);
    if (!ok) return;

    setDeletingId(supplier.id);
    setError(null);
    setSuccessMsg(null);
    try {
      const res = await suppliersApi.deleteSupplier(supplier.id);
      setSuccessMsg(res?.message || `Đã xóa nhà cung cấp "${supplier.name}".`);
      await loadSuppliers();
    } catch (err) {
      setError(extractErrorMessage(err, 'Không thể xóa nhà cung cấp.'));
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý nhà cung cấp</h1>
          <p className="text-sm text-slate-500">
            Thêm, sửa, xóa nhà cung cấp, tìm kiếm theo tên/SĐT và sắp xếp danh sách
          </p>
        </div>

        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-md bg-blue-700 px-4 py-2 text-sm font-medium text-white hover:bg-blue-800"
        >
          + Thêm nhà cung cấp
        </button>
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

      {/* Bộ lọc tìm kiếm & sắp xếp */}
      <div className="grid grid-cols-1 gap-3 rounded-xl border border-slate-200 bg-white p-4 shadow-xs md:grid-cols-3">
        <div className="md:col-span-2">
          <label className="mb-1 block text-xs font-medium text-slate-600">Tìm kiếm</label>
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo tên nhà cung cấp hoặc số điện thoại..."
            className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
          />
        </div>

        <div>
          <label className="mb-1 block text-xs font-medium text-slate-600">Sắp xếp theo</label>
          <div className="flex gap-2">
            <select
              value={sortBy}
              onChange={(e) => {
                setSortBy(e.target.value as 'id' | 'name');
                setPage(1);
              }}
              className="flex-1 rounded-md border border-slate-300 bg-white px-2.5 py-2 text-sm text-slate-800 focus:border-blue-600 focus:outline-none"
            >
              <option value="id">Mã / Thứ tự (ID)</option>
              <option value="name">Tên nhà cung cấp</option>
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
          </div>
        </div>
      </div>

      {/* Bảng nhà cung cấp */}
      <div className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-xs">
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm">
            <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-500">
              <tr>
                <th className="px-4 py-3">ID</th>
                <th className="px-4 py-3">Tên nhà cung cấp</th>
                <th className="px-4 py-3">Số điện thoại</th>
                <th className="px-4 py-3">Email</th>
                <th className="px-4 py-3">Địa chỉ</th>
                <th className="px-4 py-3 text-right">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100">
              {loading ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-400">
                    Đang tải danh sách nhà cung cấp...
                  </td>
                </tr>
              ) : suppliers.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-4 py-10 text-center text-slate-500">
                    Không tìm thấy nhà cung cấp phù hợp.
                  </td>
                </tr>
              ) : (
                suppliers.map((supplier) => (
                  <tr key={supplier.id} className="hover:bg-slate-50/80">
                    <td className="px-4 py-3 font-mono text-xs font-semibold text-slate-600">
                      #{supplier.id}
                    </td>
                    <td className="px-4 py-3 font-medium text-slate-800">{supplier.name}</td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {supplier.phone || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-700">
                      {supplier.email || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-600">
                      {supplier.address || <span className="text-slate-400">—</span>}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="inline-flex items-center gap-2">
                        <button
                          type="button"
                          onClick={() => openEditModal(supplier)}
                          className="rounded border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                        >
                          Sửa
                        </button>
                        <button
                          type="button"
                          disabled={deletingId === supplier.id}
                          onClick={() => handleDeleteSupplier(supplier)}
                          className="rounded border border-rose-200 px-2.5 py-1 text-xs font-medium text-rose-600 hover:bg-rose-50 disabled:opacity-50"
                        >
                          {deletingId === supplier.id ? 'Đang xóa...' : 'Xóa'}
                        </button>
                      </div>
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
            Tổng cộng: <span className="font-semibold text-slate-800">{totalItems}</span> nhà cung
            cấp · Trang {page}/{totalPages}
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

      {/* Modal Thêm / Sửa nhà cung cấp */}
      {showFormModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-lg rounded-xl bg-white p-6 shadow-xl">
            <div className="flex items-center justify-between border-b border-slate-100 pb-3">
              <h2 className="text-lg font-bold text-slate-800">
                {editingSupplier
                  ? `Sửa nhà cung cấp (#${editingSupplier.id})`
                  : 'Thêm nhà cung cấp mới'}
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

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Tên nhà cung cấp *
                </label>
                <input
                  type="text"
                  maxLength={200}
                  required
                  value={form.name}
                  onChange={(e) => setForm((f) => ({ ...f, name: e.target.value }))}
                  placeholder="VD: Công ty TNHH Phụ Kiện Số VN"
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">
                    Số điện thoại
                  </label>
                  <input
                    type="text"
                    value={form.phone}
                    onChange={(e) => setForm((f) => ({ ...f, phone: e.target.value }))}
                    placeholder="VD: 0901234567"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>

                <div>
                  <label className="mb-1 block text-xs font-medium text-slate-700">Email</label>
                  <input
                    type="email"
                    maxLength={100}
                    value={form.email}
                    onChange={(e) => setForm((f) => ({ ...f, email: e.target.value }))}
                    placeholder="VD: contact@ncc.vn"
                    className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                  />
                </div>
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Địa chỉ</label>
                <textarea
                  rows={2}
                  maxLength={500}
                  value={form.address}
                  onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                  placeholder="Địa chỉ nhà cung cấp..."
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
                  {submitting
                    ? 'Đang lưu...'
                    : editingSupplier
                      ? 'Lưu thay đổi'
                      : 'Thêm nhà cung cấp'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}