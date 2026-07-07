import React, { useState } from 'react';
import { NavLink, Outlet, Link } from 'react-router-dom';
import {
  LayoutGrid,
  Users,
  Store,
  MessageSquareWarning,
  Route as RouteIcon,
  Inbox,
  Sparkles,
  ArrowLeft,
  ShieldCheck,
  Menu,
  X,
} from 'lucide-react';
import { useAppContext } from '../../context/AppContext';

// ----------------------------------------------------------------------------
// AdminLayout — persistent shell for the /admin area
// ----------------------------------------------------------------------------
// Renders a sidebar of admin sections and an <Outlet /> for the active panel.
// Wrapped by RequireAdmin at the route level, so this component can assume an
// admin user is present.

interface NavItem {
  to: string;
  label: string;
  icon: React.ComponentType<{ className?: string }>;
  end?: boolean;
}

const NAV_ITEMS: NavItem[] = [
  { to: '/admin', label: 'Tổng quan', icon: LayoutGrid, end: true },
  { to: '/admin/users', label: 'Người dùng', icon: Users },
  { to: '/admin/vendors', label: 'Nhà cung cấp & Dịch vụ', icon: Store },
  { to: '/admin/moderation', label: 'Kiểm duyệt nội dung', icon: MessageSquareWarning },
  { to: '/admin/journey', label: 'Hành trình & Ưu đãi', icon: RouteIcon },
  { to: '/admin/leads', label: 'Yêu cầu dịch vụ', icon: Inbox },
  { to: '/admin/ai', label: 'Giám sát AI', icon: Sparkles },
];

export default function AdminLayout() {
  const { user } = useAppContext();
  const [mobileOpen, setMobileOpen] = useState(false);

  const navContent = (
    <nav className="flex flex-col gap-1 px-3">
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon;
        return (
          <NavLink
            key={item.to}
            to={item.to}
            end={item.end}
            onClick={() => setMobileOpen(false)}
            className={({ isActive }) =>
              `flex items-center gap-3 px-3 py-2.5 rounded-xl text-sm font-semibold transition-colors ${
                isActive
                  ? 'bg-[#F2BFC8]/20 text-white'
                  : 'text-white/60 hover:text-white hover:bg-white/5'
              }`
            }
          >
            <Icon className="w-4 h-4 shrink-0" />
            <span>{item.label}</span>
          </NavLink>
        );
      })}
    </nav>
  );

  const sidebarInner = (
    <div className="flex flex-col h-full">
      {/* Brand / header */}
      <div className="px-6 py-6 border-b border-white/10">
        <div className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-[#F2BFC8] flex items-center justify-center text-[#1B2C40]">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div>
            <p className="font-serif font-bold text-white text-base leading-tight">
              Quản trị
            </p>
            <p className="text-[10px] text-white/40 uppercase tracking-widest font-bold">
              Authority
            </p>
          </div>
        </div>
      </div>

      {/* Nav */}
      <div className="flex-1 overflow-y-auto py-4">{navContent}</div>

      {/* Footer: current admin + back to site */}
      <div className="px-4 py-4 border-t border-white/10 space-y-3">
        {user && (
          <div className="px-2">
            <p className="text-[10px] text-white/40 font-bold uppercase tracking-widest">
              Đăng nhập với tư cách
            </p>
            <p className="text-xs font-bold text-white truncate mt-0.5">
              {user.name}
            </p>
            <span className="inline-block mt-1 text-[9px] font-bold uppercase tracking-wider px-2 py-0.5 rounded-full bg-indigo-500/20 text-indigo-200">
              Admin
            </span>
          </div>
        )}
        <Link
          to="/"
          className="flex items-center gap-2 px-3 py-2 rounded-xl text-xs font-semibold text-white/60 hover:text-white hover:bg-white/5 transition-colors"
        >
          <ArrowLeft className="w-4 h-4" />
          Về trang chính
        </Link>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-[#fffdfa] flex">
      {/* Desktop sidebar */}
      <aside className="hidden lg:flex w-64 shrink-0 bg-[#1B2C40] sticky top-0 h-screen">
        {sidebarInner}
      </aside>

      {/* Mobile sidebar (overlay) */}
      {mobileOpen && (
        <div className="lg:hidden fixed inset-0 z-[80] flex">
          <div
            className="absolute inset-0 bg-black/40 backdrop-blur-sm"
            onClick={() => setMobileOpen(false)}
          />
          <aside className="relative w-64 bg-[#1B2C40] h-full">
            <button
              type="button"
              onClick={() => setMobileOpen(false)}
              className="absolute top-4 right-4 text-white/60 hover:text-white"
            >
              <X className="w-5 h-5" />
            </button>
            {sidebarInner}
          </aside>
        </div>
      )}

      {/* Main content */}
      <div className="flex-1 min-w-0 flex flex-col">
        {/* Mobile top bar */}
        <div className="lg:hidden sticky top-0 z-[70] bg-[#1B2C40] px-4 py-3 flex items-center gap-3">
          <button
            type="button"
            onClick={() => setMobileOpen(true)}
            className="text-white p-1"
          >
            <Menu className="w-6 h-6" />
          </button>
          <span className="font-serif font-bold text-white">Quản trị</span>
        </div>

        <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-[1400px] w-full mx-auto">
          <Outlet />
        </main>
      </div>
    </div>
  );
}
