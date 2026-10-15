import { NavLink, Outlet } from 'react-router-dom';

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
  return (
    <div className="flex min-h-screen">
      <aside className={`w-64 shrink-0 text-white ${headerClass}`}>
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
      </aside>
      <main className="flex-1 p-6">
        <Outlet />
      </main>
    </div>
  );
}
