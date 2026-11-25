import { useEffect, useMemo, useState, type FormEvent } from 'react';
import { ROLE_TO_ROLE_ID, usersApi } from '@/api/users.api';
import { ROLE_LABEL, type Role } from '@/types/role';
import type { CreateUserPayload, UpdateUserPayload, User } from '@/types/user';

const MANAGER_ROLE = 'WAREHOUSE_MANAGER' as Role;
const STAFF_ROLE = 'WAREHOUSE_STAFF' as Role;
const ADMIN_ROLE = 'ADMIN' as Role;

type AssignableRole = typeof MANAGER_ROLE | typeof STAFF_ROLE;

interface FormState {
  username: string;
  email: string;
  phone: string;
  fullName: string;
  password: string;
  role: AssignableRole;
}

const INITIAL_FORM: FormState = {
  username: '',
  email: '',
  phone: '',
  fullName: '',
  password: '',
  role: STAFF_ROLE,
};

function toAssignableRole(role?: Role | string): AssignableRole {
  return role === MANAGER_ROLE ? MANAGER_ROLE : STAFF_ROLE;
}

function getRoleBadgeClass(role: Role | string): string {
  if (role === MANAGER_ROLE) {
    return 'bg-sky-50 text-sky-700 ring-1 ring-inset ring-sky-600/20';
  }
  return 'bg-slate-100 text-slate-700 ring-1 ring-inset ring-slate-600/20';
}

export default function UserManagementPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [notice, setNotice] = useState<string | null>(null);

  const [search, setSearch] = useState('');
  const [roleFilter, setRoleFilter] = useState<'ALL' | AssignableRole>('ALL');

  const [modalOpen, setModalOpen] = useState(false);
  const [editingUser, setEditingUser] = useState<User | null>(null);
  const [form, setForm] = useState<FormState>(INITIAL_FORM);

  const loadUsers = async () => {
    setLoading(true);
    setError(null);
    try {
      const data = await usersApi.getAll();
      // Ẩn tài khoản Admin duy nhất khỏi danh sách quản lý
      setUsers(data.filter((u) => u.role !== ADMIN_ROLE));
    } catch (err) {
      setError(usersApi.getErrorMessage(err, 'Không thể tải danh sách người dùng.'));
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadUsers();
  }, []);

  const filteredUsers = useMemo(() => {
    const q = search.trim().toLowerCase();
    return users.filter((u) => {
      if (u.role === ADMIN_ROLE) return false;
      const matchRole = roleFilter === 'ALL' || u.role === roleFilter;
      const matchQuery =
        !q ||
        u.username.toLowerCase().includes(q) ||
        u.fullName.toLowerCase().includes(q) ||
        (u.email ?? '').toLowerCase().includes(q) ||
        (u.phone ?? '').toLowerCase().includes(q);
      return matchRole && matchQuery;
    });
  }, [users, search, roleFilter]);

  const openCreateModal = () => {
    setEditingUser(null);
    setForm(INITIAL_FORM);
    setError(null);
    setModalOpen(true);
  };

  const openEditModal = (user: User) => {
    setEditingUser(user);
    setForm({
      username: user.username,
      email: user.email ?? '',
      phone: user.phone ?? '',
      fullName: user.fullName,
      password: '',
      role: toAssignableRole(user.role),
    });
    setError(null);
    setModalOpen(true);
  };

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setSubmitting(true);
    setError(null);
    setNotice(null);

    try {
      const targetRole = toAssignableRole(form.role);
      const nextRoleId = ROLE_TO_ROLE_ID[targetRole];

      if (editingUser) {
        const payload: UpdateUserPayload = {
          fullName: form.fullName.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          roleId: nextRoleId,
        };
        if (form.password.trim()) {
          payload.password = form.password.trim();
        }
        let updated = await usersApi.update(editingUser.id, payload);
        if (targetRole !== editingUser.role) {
          updated = await usersApi.updateRole(editingUser.id, nextRoleId);
        }
        const normalizedUpdated: User = {
          ...editingUser,
          ...updated,
          role: targetRole,
          roleId: nextRoleId,
        };
        setUsers((prev) =>
          prev.map((item) => (item.id === editingUser.id ? normalizedUpdated : item)),
        );
        setNotice(`Đã cập nhật tài khoản "${normalizedUpdated.username}".`);
      } else {
        const payload: CreateUserPayload = {
          username: form.username.trim(),
          email: form.email.trim() || undefined,
          phone: form.phone.trim() || undefined,
          fullName: form.fullName.trim(),
          password: form.password,
          roleId: nextRoleId,
        };
        const created = await usersApi.create(payload);
        const normalizedCreated: User = {
          ...created,
          role: targetRole,
          roleId: nextRoleId,
          isActive: created.isActive ?? true,
        };
        setUsers((prev) => [normalizedCreated, ...prev]);
        setNotice(`Đã tạo tài khoản "${normalizedCreated.username}".`);
      }
      setModalOpen(false);
    } catch (err) {
      setError(usersApi.getErrorMessage(err, 'Lưu thông tin người dùng thất bại.'));
    } finally {
      setSubmitting(false);
    }
  };

  const handleToggleLock = async (user: User) => {
    setError(null);
    setNotice(null);
    const nextActive = !user.isActive;
    try {
      const updated = await usersApi.update(user.id, { isActive: nextActive });
      const actualActive =
        typeof updated?.isActive === 'boolean' ? updated.isActive : nextActive;

      setUsers((prev) =>
        prev.map((item) =>
          item.id === user.id
            ? {
                ...item,
                ...updated,
                isActive: actualActive,
              }
            : item,
        ),
      );

      if (!actualActive) {
        setNotice(`Tài khoản "${user.username}" đã bị vô hiệu hóa.`);
      } else {
        setNotice(`Đã mở khóa tài khoản "${user.username}".`);
      }
    } catch (err) {
      setError(usersApi.getErrorMessage(err, 'Không thể cập nhật trạng thái tài khoản.'));
    }
  };

  return (
    <div className="space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Quản lý người dùng</h2>
          <p className="text-sm text-slate-500">
            Cấp tài khoản, phân quyền (Quản lý kho / Nhân viên kho) và quản lý trạng thái truy cập
          </p>
        </div>
        <button
          type="button"
          onClick={openCreateModal}
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          + Thêm người dùng
        </button>
      </div>

      {notice && (
        <div className="rounded-md border border-emerald-200 bg-emerald-50 px-4 py-2.5 text-sm text-emerald-800">
          {notice}
        </div>
      )}
      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-2.5 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="flex flex-wrap gap-3 rounded-lg border border-slate-200 bg-white p-4">
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Tìm theo tên đăng nhập, họ tên, email, SĐT..."
          className="min-w-[240px] flex-1 rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        />
        <select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value as 'ALL' | AssignableRole)}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm focus:border-slate-500 focus:outline-none"
        >
          <option value="ALL">Tất cả vai trò</option>
          <option value={MANAGER_ROLE}>{ROLE_LABEL[MANAGER_ROLE]}</option>
          <option value={STAFF_ROLE}>{ROLE_LABEL[STAFF_ROLE]}</option>
        </select>
        <button
          type="button"
          onClick={loadUsers}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-700 hover:bg-slate-50"
        >
          Làm mới
        </button>
      </div>

      <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white">
        <table className="w-full text-left text-sm">
          <thead className="border-b border-slate-200 bg-slate-50 text-xs uppercase text-slate-600">
            <tr>
              <th className="px-4 py-3">Tài khoản</th>
              <th className="px-4 py-3">Họ tên</th>
              <th className="px-4 py-3">Số điện thoại</th>
              <th className="px-4 py-3">Vai trò</th>
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3 text-center">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {loading ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Đang tải danh sách người dùng...
                </td>
              </tr>
            ) : filteredUsers.length === 0 ? (
              <tr>
                <td colSpan={6} className="px-4 py-8 text-center text-slate-500">
                  Không có người dùng phù hợp.
                </td>
              </tr>
            ) : (
              filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-slate-50/70">
                  <td className="px-4 py-3 align-middle">
                    <div className="font-semibold text-slate-800">{user.username}</div>
                    <div className="text-xs text-slate-500">{user.email || '—'}</div>
                  </td>
                  <td className="px-4 py-3 align-middle text-slate-700">{user.fullName || '—'}</td>
                  <td className="px-4 py-3 align-middle text-slate-700">{user.phone || '—'}</td>
                  <td className="px-4 py-3 align-middle">
                    <span
                      className={`inline-flex rounded-md px-2.5 py-1 text-xs font-medium ${getRoleBadgeClass(user.role)}`}
                    >
                      {ROLE_LABEL[user.role]}
                    </span>
                  </td>
                  <td className="px-4 py-3 align-middle">
                    {user.isActive ? (
                      <span className="inline-flex rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-800">
                        Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex rounded-full bg-rose-100 px-2.5 py-0.5 text-xs font-medium text-rose-800">
                        Đã khóa
                      </span>
                    )}
                  </td>
                  <td className="px-4 py-3 align-middle text-center">
                    <div className="inline-flex items-center justify-center gap-1.5">
                      <button
                        type="button"
                        onClick={() => openEditModal(user)}
                        className="rounded border border-slate-300 px-2.5 py-1 text-xs font-medium text-slate-700 hover:bg-slate-100"
                      >
                        Sửa
                      </button>
                      <button
                        type="button"
                        onClick={() => handleToggleLock(user)}
                        className="rounded border border-amber-300 px-2.5 py-1 text-xs font-medium text-amber-800 hover:bg-amber-50"
                      >
                        {user.isActive ? 'Khóa' : 'Mở khóa'}
                      </button>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-slate-900/50 p-4">
          <div className="w-full max-w-md rounded-lg bg-white p-6 shadow-xl">
            <h3 className="text-lg font-bold text-slate-800">
              {editingUser ? `Cập nhật: ${editingUser.username}` : 'Thêm người dùng mới'}
            </h3>

            <form onSubmit={handleSubmit} className="mt-4 space-y-3">
              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  Tên đăng nhập *
                </label>
                <input
                  type="text"
                  required
                  disabled={Boolean(editingUser)}
                  value={form.username}
                  onChange={(e) => setForm((prev) => ({ ...prev, username: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm disabled:bg-slate-100"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Họ và tên *</label>
                <input
                  type="text"
                  required
                  value={form.fullName}
                  onChange={(e) => setForm((prev) => ({ ...prev, fullName: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Email</label>
                <input
                  type="email"
                  value={form.email}
                  onChange={(e) => setForm((prev) => ({ ...prev, email: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Số điện thoại</label>
                <input
                  type="text"
                  value={form.phone}
                  onChange={(e) => setForm((prev) => ({ ...prev, phone: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">
                  {editingUser ? 'Mật khẩu mới (để trống nếu giữ nguyên)' : 'Mật khẩu *'}
                </label>
                <input
                  type="password"
                  required={!editingUser}
                  minLength={editingUser ? undefined : 6}
                  value={form.password}
                  onChange={(e) => setForm((prev) => ({ ...prev, password: e.target.value }))}
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                />
              </div>

              <div>
                <label className="mb-1 block text-xs font-medium text-slate-700">Vai trò *</label>
                <select
                  value={form.role}
                  onChange={(e) =>
                    setForm((prev) => ({ ...prev, role: toAssignableRole(e.target.value) }))
                  }
                  className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm"
                >
                  <option value={MANAGER_ROLE}>{ROLE_LABEL[MANAGER_ROLE]}</option>
                  <option value={STAFF_ROLE}>{ROLE_LABEL[STAFF_ROLE]}</option>
                </select>
              </div>

              <div className="mt-5 flex justify-end gap-2 border-t border-slate-100 pt-4">
                <button
                  type="button"
                  onClick={() => setModalOpen(false)}
                  className="rounded-md border border-slate-300 px-4 py-2 text-sm text-slate-700 hover:bg-slate-50"
                >
                  Hủy
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700 disabled:opacity-60"
                >
                  {submitting ? 'Đang lưu...' : editingUser ? 'Lưu thay đổi' : 'Tạo người dùng'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}