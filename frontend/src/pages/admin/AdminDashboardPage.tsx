import { useEffect, useMemo, useState } from 'react';
import { Link } from 'react-router-dom';
import { usersApi } from '@/api/users.api';
import { Role, ROLE_LABEL } from '@/types/role';
import type { User } from '@/types/user';

export default function AdminDashboardPage() {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    usersApi
      .getAll()
      .then((data) => {
        // Hệ thống chỉ có 1 Admin duy nhất và ẩn khỏi danh sách quản lý
        if (active) setUsers(data.filter((u) => u.role !== Role.ADMIN));
      })
      .catch((err) => {
        if (active) setError(usersApi.getErrorMessage(err, 'Không tải được dữ liệu người dùng.'));
      })
      .finally(() => {
        if (active) setLoading(false);
      });
    return () => {
      active = false;
    };
  }, []);

  const counts = useMemo(() => {
    return {
      total: users.length,
      active: users.filter((u) => u.isActive).length,
      manager: users.filter((u) => u.role === Role.WAREHOUSE_MANAGER).length,
      staff: users.filter((u) => u.role === Role.WAREHOUSE_STAFF).length,
    };
  }, [users]);

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div>
          <h2 className="text-2xl font-bold text-slate-800">Tổng quan hệ thống</h2>
          <p className="text-sm text-slate-500">Thống kê tài khoản theo vai trò và trạng thái</p>
        </div>
        <Link
          to="/admin/users"
          className="rounded-md bg-slate-800 px-4 py-2 text-sm font-medium text-white hover:bg-slate-700"
        >
          Quản lý người dùng →
        </Link>
      </div>

      {error && (
        <div className="rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">Tổng người dùng</p>
          <p className="mt-2 text-3xl font-bold text-slate-800">{loading ? '...' : counts.total}</p>
          <p className="mt-1 text-xs text-emerald-700">
            Đang hoạt động: {loading ? '...' : counts.active}
          </p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">{ROLE_LABEL[Role.WAREHOUSE_MANAGER]}</p>
          <p className="mt-2 text-3xl font-bold text-blue-700">{loading ? '...' : counts.manager}</p>
        </div>

        <div className="rounded-lg border border-slate-200 bg-white p-5">
          <p className="text-xs font-medium text-slate-500">{ROLE_LABEL[Role.WAREHOUSE_STAFF]}</p>
          <p className="mt-2 text-3xl font-bold text-emerald-700">
            {loading ? '...' : counts.staff}
          </p>
        </div>
      </div>
    </div>
  );
}