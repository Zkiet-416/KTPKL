import { useState, type FormEvent } from 'react';

/**
 * Trang đăng nhập chung (trang đầu tiên khi mở web) cho Admin / Quản lý kho / Nhân viên kho.
 * Không có đăng ký: tài khoản do Admin tạo và phân quyền trong cổng /admin.
 * TODO (TV1): gọi API /auth/login → lưu token → chuyển hướng theo vai trò:
 *   ADMIN -> /admin | WAREHOUSE_MANAGER -> /manager | WAREHOUSE_STAFF -> /staff
 */
export default function LoginPage() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [notice, setNotice] = useState('');

  const handleSubmit = (e: FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    // TODO (TV1): thay bằng gọi API đăng nhập thật
    setNotice(`Chức năng đăng nhập đang được phát triển (tài khoản nhập: ${username || '—'}).`);
    setPassword('');
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

          {notice && <p className="mb-4 rounded-md bg-amber-50 p-3 text-sm text-amber-800">{notice}</p>}

          <button
            type="submit"
            className="w-full rounded-lg bg-blue-700 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-800"
          >
            Đăng nhập
          </button>

          <p className="mt-5 text-center text-xs text-slate-500">
            Chưa có tài khoản? Vui lòng liên hệ Quản trị viên (Admin) để được cấp tài khoản.
          </p>
        </form>
      </div>
    </div>
  );
}
