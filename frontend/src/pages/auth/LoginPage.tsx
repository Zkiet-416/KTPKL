/**
 * Phụ trách: TV1 (tuần 2) - Đăng nhập, sau đó điều hướng theo vai trò:
 *   ADMIN -> /admin | WAREHOUSE_MANAGER -> /manager | WAREHOUSE_STAFF -> /staff
 */
export default function LoginPage() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="w-full max-w-sm rounded-xl border border-slate-200 bg-white p-8 shadow-sm">
        <h1 className="mb-1 text-xl font-bold">Đăng nhập</h1>
        <p className="mb-6 text-sm text-slate-500">Hệ thống quản lý kho phụ kiện điện thoại</p>
        <div className="space-y-3">
          <input disabled placeholder="Tên đăng nhập" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <input disabled type="password" placeholder="Mật khẩu" className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm" />
          <button disabled className="w-full rounded-md bg-blue-700 py-2 text-sm font-semibold text-white opacity-60">
            Đăng nhập (TV1 triển khai ở tuần 2)
          </button>
        </div>
      </div>
    </div>
  );
}
