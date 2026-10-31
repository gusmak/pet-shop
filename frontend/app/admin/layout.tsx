'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { Menu, X } from 'lucide-react';
import { useAuth } from '@/lib/useAuth';
import { ADMIN_NAV, ROLE_LABELS, canAccessAdminPath } from '@/lib/permissions';
import { DEMO_MODE } from '@/lib/demo';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const pathname = usePathname();
  const router = useRouter();
  const { user, loading, logout, can, permissions } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const allowedArea = can('admin.access');

  // Chưa đăng nhập -> trang đăng nhập; khách hàng không có khu quản trị -> trang tài khoản.
  useEffect(() => {
    if (loading) return;
    if (!user) router.replace('/login');
    else if (!allowedArea) router.replace('/account');
  }, [loading, user, allowedArea, router]);

  if (loading || !user || !allowedArea) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Đang tải...</p>
        </div>
      </div>
    );
  }

  const navItems = ADMIN_NAV.filter((i) => can(i.permission));
  const permitted = canAccessAdminPath(permissions, pathname);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Mobile top bar */}
      <div className="lg:hidden fixed top-0 inset-x-0 h-14 bg-white border-b border-gray-200 z-40 flex items-center justify-between px-4">
        <span className="font-bold text-primary-600">PetShop Admin</span>
        <button onClick={() => setMenuOpen((o) => !o)} className="p-2 rounded-lg hover:bg-gray-100" aria-label="Mở menu">
          {menuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
        </button>
      </div>
      {menuOpen && <div className="lg:hidden fixed inset-0 bg-black/40 z-40" onClick={() => setMenuOpen(false)} />}

      {/* Sidebar */}
      <aside
        className={`fixed left-0 top-0 h-full w-64 bg-white border-r border-gray-200 z-50 transition-transform lg:translate-x-0 ${
          menuOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        <div className="p-6 border-b border-gray-200">
          <h1 className="text-2xl font-bold text-primary-600">PetShop Admin</h1>
          <div className="mt-2 text-sm text-gray-600">
            <div className="font-semibold">{user.name}</div>
            <div className="text-xs">Nhóm {ROLE_LABELS[user.role]}</div>
          </div>
        </div>
        <nav className="p-4 space-y-2">
          {navItems.map((item) => {
            const active = item.href === '/admin' ? pathname === '/admin' : pathname.startsWith(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                onClick={() => setMenuOpen(false)}
                className={`flex items-center gap-3 px-4 py-3 rounded-lg transition-colors ${
                  active ? 'bg-primary-50 text-primary-600 font-semibold' : 'text-gray-700 hover:bg-primary-50 hover:text-primary-600'
                }`}
              >
                <span>{item.icon}</span>
                <span>{item.label}</span>
              </Link>
            );
          })}
        </nav>
        <div className="absolute bottom-0 left-0 right-0 p-4 border-t border-gray-200 space-y-2">
          <Link href="/" className="block text-center text-sm text-gray-500 hover:text-primary-600">
            ← Về trang chủ
          </Link>
          <button
            onClick={() => {
              logout();
              router.push('/login');
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg hover:bg-red-50 text-gray-700 hover:text-red-600 transition-colors"
          >
            <span>🚪</span>
            <span>Đăng xuất</span>
          </button>
        </div>
      </aside>

      <main className="lg:ml-64 p-4 pt-20 lg:p-8">
        {DEMO_MODE && (
          <div className="mb-6 rounded-lg bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-2">
            Chế độ demo — dữ liệu chỉ lưu trong trình duyệt này, không gửi lên server.
          </div>
        )}
        {permitted ? (
          children
        ) : (
          <div className="text-center py-24 text-gray-600">
            <div className="text-5xl mb-4">🔒</div>
            <p className="font-semibold text-gray-900">Bạn không có quyền truy cập trang này</p>
          </div>
        )}
      </main>
    </div>
  );
}
