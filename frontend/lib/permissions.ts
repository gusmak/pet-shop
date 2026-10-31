// Mô hình phân quyền: User -> Nhóm (group) -> Quyền (permission).
// Lưu ý: đây chỉ là lớp hiển thị ở FE — dữ liệu thật phải được chặn bằng guard ở backend.

export type Role = 'admin' | 'monitor' | 'customer'; // id của nhóm

export const GROUPS: { id: Role; label: string; description: string; locked?: boolean }[] = [
  { id: 'admin', label: 'Nhóm Admin', description: 'Quản trị viên — toàn quyền hệ thống', locked: true },
  { id: 'monitor', label: 'Nhóm Monitor', description: 'Nhân viên (staff) — theo dõi lịch đặt và đăng bài' },
  { id: 'customer', label: 'Nhóm Customer', description: 'Khách hàng — mặc định khi đăng ký trên website' },
];

export const ROLE_LABELS: Record<Role, string> = {
  admin: 'Admin',
  monitor: 'Monitor',
  customer: 'Customer',
};

export const PERMISSIONS = [
  { key: 'admin.access', label: 'Vào khu quản trị' },
  { key: 'dashboard.revenue', label: 'Xem doanh thu & số liệu dịch vụ' },
  { key: 'bookings.view', label: 'Xem lịch đặt' },
  { key: 'bookings.manage', label: 'Xác nhận / hoàn thành / hủy lịch' },
  { key: 'posts.write', label: 'Viết bài và sửa/xóa bài của mình' },
  { key: 'posts.manage_all', label: 'Sửa/xóa bài của mọi người' },
  { key: 'services.manage', label: 'Quản lý dịch vụ' },
  { key: 'customers.view', label: 'Xem khách hàng' },
  { key: 'staff.manage', label: 'Quản lý nhân viên' },
  { key: 'groups.manage', label: 'Quản lý nhóm & tài khoản' },
  { key: 'account.view', label: 'Xem tài khoản & lịch sử đặt lịch của mình' },
] as const;

export type Permission = (typeof PERMISSIONS)[number]['key'];

const ALL = PERMISSIONS.map((p) => p.key) as Permission[];

export const DEFAULT_GROUP_PERMISSIONS: Record<Role, Permission[]> = {
  admin: ALL,
  monitor: ['admin.access', 'bookings.view', 'posts.write', 'account.view'],
  customer: ['account.view'],
};

const STORAGE_KEY = 'demo.groupPerms';

// Quyền hiện hành của nhóm (chế độ demo cho phép chỉnh và lưu localStorage). Nhóm admin luôn đủ quyền.
export function getGroupPermissions(group: Role): Permission[] {
  if (group === 'admin') return ALL;
  try {
    const stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}') as Partial<Record<Role, Permission[]>>;
    return stored[group] ?? DEFAULT_GROUP_PERMISSIONS[group];
  } catch {
    return DEFAULT_GROUP_PERMISSIONS[group];
  }
}

export function setGroupPermissions(group: Role, perms: Permission[]) {
  if (group === 'admin') return; // nhóm admin bị khóa
  let stored: Partial<Record<Role, Permission[]>> = {};
  try {
    stored = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
  } catch {
    // dữ liệu hỏng — ghi đè
  }
  localStorage.setItem(STORAGE_KEY, JSON.stringify({ ...stored, [group]: perms }));
  window.dispatchEvent(new Event('auth-change')); // để useAuth tính lại quyền
}

export interface NavItem {
  href: string;
  icon: string;
  label: string;
  permission: Permission;
}

export const ADMIN_NAV: NavItem[] = [
  { href: '/admin', icon: '📊', label: 'Tổng quan', permission: 'admin.access' },
  { href: '/admin/bookings', icon: '📅', label: 'Đặt lịch', permission: 'bookings.view' },
  { href: '/admin/posts', icon: '📝', label: 'Bài viết', permission: 'posts.write' },
  { href: '/admin/services', icon: '💼', label: 'Dịch vụ', permission: 'services.manage' },
  { href: '/admin/users', icon: '👥', label: 'Khách hàng', permission: 'customers.view' },
  { href: '/admin/staff', icon: '👨‍💼', label: 'Nhân viên', permission: 'staff.manage' },
  { href: '/admin/groups', icon: '🛡️', label: 'Nhóm & phân quyền', permission: 'groups.manage' },
];

// Trang đích sau khi đăng nhập.
export const homeFor = (perms: Permission[]) => (perms.includes('admin.access') ? '/admin' : '/account');

export function canAccessAdminPath(perms: Permission[], pathname: string): boolean {
  // Khớp mục dài nhất trước để '/admin' không "nuốt" các trang con.
  const item = [...ADMIN_NAV]
    .sort((a, b) => b.href.length - a.href.length)
    .find((i) => (i.href === '/admin' ? pathname === '/admin' : pathname.startsWith(i.href)));
  return !!item && perms.includes(item.permission);
}
