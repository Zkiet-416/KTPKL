import { useState, type FormEvent } from 'react';
import { useNavigate } from 'react-router-dom';
import { http } from '@/api/client';
import { Role } from '@/types/role';

function getPortalPathByRole(role?: string): string {
  if (role === Role.ADMIN) return '/admin';
  if (role === Role.WAREHOUSE_MANAGER) return '/manager';
  if (role === Role.WAREHOUSE_STAFF) return '/staff';
  return '/admin';
}

export default function LoginPage() {
  const navigate = useNavigate();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = async (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const res = await http.post('/auth/login', {
        username: username.trim(),
        password,
      });

      const data = res.data?.data ?? res.data;
      const token: string | undefined = data?.access_token ?? data?.accessToken ?? data?.token;
      const user = data?.user ?? data;
      const role: string | undefined = user?.role ?? data?.role;

      if (!token) {
        setError('Đăng nhập thành công nhưng không tìm thấy token trả về từ máy chủ.');
        return;
      }

      localStorage.setItem('access_token', token);
      if (user) {
        localStorage.setItem('current_user', JSON.stringify(user));
      }

      navigate(getPortalPathByRole(role), { replace: true });
    } catch (err: unknown) {
      const axiosErr = err as { response?: { data?: { message?: string | string[] } }; message?: string };
      const msg = axiosErr?.response?.data?.message;
      if (Array.isArray(msg)) {
        setError(msg.join(', '));
      } else if (typeof msg === 'string' && msg.trim()) {
        setError(msg);
      } else {
        setError(axiosErr?.message || 'Tên đăng nhập hoặc mật khẩu không đúng.');
      }
      setPassword('');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-gradient-to-br from-slate-50 via-blue-50 to-indigo-100 px-4">
      <div className="w-full max-w-md">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-16 w-16 items-center justify-center rounded-2xl bg-blue-700 text-3xl shadow-md">
            📦
          </div>
          <h1 className="text-2xl font-bold text-slate-800">Quản lý kho phụ kiện điện thoại</h1>
          <p className="mt-1 text-sm text-slate-500">Hệ thống quản lý nhập xuất kho</p>
        </div>

        <form onSubmit={handleSubmit} className="rounded-2xl bg-white p-8 shadow-lg">
          <h2 className="mb-5 text-lg font-bold text-slate-800">Đăng nhập</h2>

          <label htmlFor="username" className="mb-1 block text-sm font-medium text-slate-700">
            Tên đăng nhập
          </label>
          <input
            id="username"
            type="text"
            autoComplete="username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Nhập tên đăng nhập"
            className="mb-4 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            required
          />

          <label htmlFor="password" className="mb-1 block text-sm font-medium text-slate-700">
            Mật khẩu
          </label>
          <input
            id="password"
            type="password"
            autoComplete="current-password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Nhập mật khẩu"
            className="mb-5 w-full rounded-lg border border-slate-300 px-3 py-2 text-sm outline-none focus:border-blue-600 focus:ring-2 focus:ring-blue-200"
            required
          />

          {error && <p className="mb-4 rounded-md bg-red-50 p-3 text-sm text-red-700">{error}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800 disabled:opacity-60"
          >
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>

          <p className="mt-5 text-center text-xs text-slate-500">
            Chưa có tài khoản? Vui lòng liên hệ Quản trị viên (Admin) để được cấp tài khoản.
          </p>
        </form>
      </div>
    </div>
  );
}