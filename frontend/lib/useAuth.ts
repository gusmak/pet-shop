import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DEMO_MODE, DEMO_TOKEN, readAccounts, type DemoUser } from '@/lib/demo';
import { getGroupPermissions, type Permission, type Role } from '@/lib/permissions';

export type AuthUser = DemoUser;

const AUTH_EVENT = 'auth-change';
const VALID_ROLES: Role[] = ['admin', 'monitor', 'customer'];

const readStoredUser = (): AuthUser | null => {
  try {
    const raw = localStorage.getItem('authUser');
    const user = raw ? (JSON.parse(raw) as AuthUser) : null;
    return user && VALID_ROLES.includes(user.role) ? user : null; // phiên cũ với role lạ -> bắt đăng nhập lại
  } catch {
    return null;
  }
};

export function saveSession(token: string, user: AuthUser) {
  localStorage.setItem('accessToken', token);
  localStorage.setItem('authUser', JSON.stringify(user));
  window.dispatchEvent(new Event(AUTH_EVENT));
}

export function clearSession() {
  localStorage.removeItem('accessToken');
  localStorage.removeItem('authUser');
  window.dispatchEvent(new Event(AUTH_EVENT));
}

// Dùng ở mọi nơi cần biết ai đang đăng nhập (Header, admin, tài khoản).
// Không tự chuyển hướng — việc chặn trang do layout/page đảm nhiệm dựa trên { user, loading }.
export function useAuth() {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [permissions, setPermissions] = useState<Permission[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const token = localStorage.getItem('accessToken');
      const stored = readStoredUser();
      let next: AuthUser | null = null;

      if (token && stored) {
        if (token === DEMO_TOKEN && !DEMO_MODE) {
          clearSession(); // token demo còn sót lại sau khi tắt chế độ demo — backend sẽ từ chối
        } else if (token === DEMO_TOKEN) {
          // Phiên demo: lấy lại tài khoản từ kho để nhóm mới (nếu admin vừa đổi) có hiệu lực ngay.
          const account = readAccounts().find((a) => a.id === stored.id);
          if (account) {
            const { password, ...safe } = account;
            void password;
            next = safe;
          }
        } else {
          const res = await api.get<AuthUser>('/api/auth/me');
          if (res.data) next = res.data;
          else if (res.status === 401) clearSession();
          else next = stored; // lỗi server/mạng — dùng bản đã cache
        }
      }
      if (!cancelled) {
        setUser(next);
        setPermissions(next ? getGroupPermissions(next.role) : []);
        setLoading(false);
      }
    };

    load();
    window.addEventListener(AUTH_EVENT, load);
    return () => {
      cancelled = true;
      window.removeEventListener(AUTH_EVENT, load);
    };
  }, []);

  const logout = useCallback(() => clearSession(), []);
  const can = useCallback((p: Permission) => permissions.includes(p), [permissions]);

  return { user, loading, logout, role: user?.role, permissions, can };
}
