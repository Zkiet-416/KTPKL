import { NavLink, Outlet, useNavigate } from 'react-router-dom';

export interface NavItem {
  to: string;
  label: string;
  end?: boolean;
}

interface PortalLayoutProps {
  title: string;
  subtitle: string;
  /** Class màu nền cho thanh trên + menu, ví dụ 'bg-blue-700' (viết đầy đủ để Tailwind nhận diện) */
  headerClass: string;
  navItems: NavItem[];
}

/** Khung giao diện dùng chung cho 3 cổng (Admin / Quản lý kho / Nhân viên kho) */
export default function PortalLayout({ title, subtitle, headerClass, navItems }: PortalLayoutProps) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem('access_token');
    localStorage.removeItem('current_user');
    navigate('/', { replace: true });
  };

  return (
    <div className="flex h-screen w-full overflow-hidden bg-slate-50">
      <aside className={`flex h-full w-64 shrink-0 flex-col justify-between text-white ${headerClass}`}>
        <div className="overflow-y-auto">
          <div className="border-b border-white/20 p-5">
            <h1 className="text-lg font-bold">{title}</h1>
            <p className="text-sm text-white/70">{subtitle}</p>
          </div>
          <nav className="flex flex-col gap-1 p-3">
            {navItems.map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                end={item.end}
                className={({ isActive }) =>
                  `rounded-md px-3 py-2 text-sm transition ${
                    isActive ? 'bg-white/25 font-semibold' : 'hover:bg-white/15'
                  }`
                }
              >
                {item.label}
              </NavLink>
            ))}
          </nav>
        </div>

        <div className="border-t border-white/20 p-3">
          <button
            type="button"
            onClick={handleLogout}
            className="w-full rounded-md bg-white/10 px-3 py-2 text-left text-sm font-medium text-white/90 transition hover:bg-white/20"
          >
            Đăng xuất
          </button>
        </div>
      </aside>
      <main className="min-w-0 flex-1 overflow-y-auto p-6">
        <Outlet />
      </main>
    </div>
  );
}