import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { getHealth, type HealthResponse } from '@/api/health.api';
import { API_URL, SWAGGER_URL } from '@/config/env';

type CheckState =
  | { phase: 'loading' }
  | { phase: 'ok'; data: HealthResponse }
  | { phase: 'error'; message: string };

function Badge({ ok, label }: { ok: boolean | null; label: string }) {
  const color =
    ok === null ? 'bg-slate-200 text-slate-600' : ok ? 'bg-emerald-100 text-emerald-700' : 'bg-red-100 text-red-700';
  return <span className={`rounded-full px-3 py-1 text-xs font-semibold ${color}`}>{label}</span>;
}

/**
 * Trang kiểm tra môi trường (tuần 1): hiển thị FE / BE / DB đã chạy chưa.
 * Địa chỉ: /setup (trang đầu tiên của web là trang đăng nhập).
 */
export default function HomePage() {
  const [state, setState] = useState<CheckState>({ phase: 'loading' });

  useEffect(() => {
    getHealth()
      .then((data) => setState({ phase: 'ok', data }))
      .catch((err: unknown) =>
        setState({ phase: 'error', message: err instanceof Error ? err.message : 'Không gọi được API' }),
      );
  }, []);

  const be = state.phase === 'loading' ? null : state.phase === 'ok';
  const db = state.phase === 'loading' ? null : state.phase === 'ok' ? state.data.database.status === 'up' : false;

  return (
    <div className="mx-auto max-w-2xl p-8">
      <h1 className="text-3xl font-bold text-blue-700">Quản lý kho phụ kiện điện thoại</h1>
      <p className="mt-1 text-slate-600">Đồ án môn Phân tích thiết kế Hệ thống thông tin</p>

      <section className="mt-8 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-4 text-lg font-semibold">Kiểm tra môi trường</h2>
        <ul className="space-y-3 text-sm">
          <li className="flex items-center justify-between">
            <span>Frontend (React + Vite + Tailwind)</span>
            <Badge ok={true} label="Đang chạy" />
          </li>
          <li className="flex items-center justify-between">
            <span>Backend (NestJS) — {API_URL}</span>
            <Badge ok={be} label={be === null ? 'Đang kiểm tra...' : be ? 'Đang chạy' : 'Không kết nối được'} />
          </li>
          <li className="flex items-center justify-between">
            <span>
              Database (SQL Server)
              {state.phase === 'ok' && state.data.database.name ? ` — ${state.data.database.name}` : ''}
            </span>
            <Badge ok={db} label={db === null ? 'Đang kiểm tra...' : db ? 'Đã kết nối' : 'Chưa kết nối'} />
          </li>
        </ul>

        {state.phase === 'error' && (
          <p className="mt-4 rounded-md bg-red-50 p-3 text-sm text-red-700">
            Lỗi: {state.message}. Hãy chắc chắn Backend đã chạy (<code>npm run start:dev</code> trong thư mục
            backend) và VITE_API_URL đúng.
          </p>
        )}
        {state.phase === 'ok' && state.data.database.status === 'down' && (
          <p className="mt-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">
            Backend chạy nhưng chưa kết nối được DB: {state.data.database.error}
          </p>
        )}
      </section>

      <section className="mt-6 rounded-xl border border-slate-200 bg-white p-6 shadow-sm">
        <h2 className="mb-3 text-lg font-semibold">Các cổng giao diện (tách biệt)</h2>
        <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
          <Link to="/admin" className="rounded-lg bg-slate-800 p-4 text-center text-sm font-semibold text-white hover:opacity-90">
            Admin
          </Link>
          <Link to="/manager" className="rounded-lg bg-blue-700 p-4 text-center text-sm font-semibold text-white hover:opacity-90">
            Quản lý kho
          </Link>
          <Link to="/staff" className="rounded-lg bg-emerald-700 p-4 text-center text-sm font-semibold text-white hover:opacity-90">
            Nhân viên kho
          </Link>
        </div>
        <p className="mt-4 text-sm text-slate-500">
          <Link to="/" className="text-blue-600 hover:underline">
            Trang đăng nhập
          </Link>{' '}
          ·{' '}
          <a href={SWAGGER_URL} target="_blank" rel="noreferrer" className="text-blue-600 hover:underline">
            Swagger API
          </a>
        </p>
      </section>
    </div>
  );
}
