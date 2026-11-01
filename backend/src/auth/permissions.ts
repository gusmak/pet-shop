// Danh mục quyền — phải khớp với bảng `permissions` trong schema.sql / seed.ts và web/lib/permissions.ts.
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
  { key: 'settings.manage', label: 'Quản lý cấu hình hệ thống' },
  { key: 'account.view', label: 'Xem tài khoản & lịch sử đặt lịch của mình' },
] as const;

export type PermissionKey = (typeof PERMISSIONS)[number]['key'];

export const DEFAULT_GROUP_PERMISSIONS: Record<string, PermissionKey[]> = {
  admin: PERMISSIONS.map((p) => p.key),
  monitor: ['admin.access', 'bookings.view', 'posts.write', 'account.view'],
  customer: ['account.view'],
};

export const GROUP_DEFS = [
  { key: 'admin', name: 'Nhóm Admin', description: 'Quản trị viên — toàn quyền hệ thống', isLocked: true },
  { key: 'monitor', name: 'Nhóm Monitor', description: 'Nhân viên (staff) — theo dõi lịch đặt và đăng bài', isLocked: false },
  { key: 'customer', name: 'Nhóm Customer', description: 'Khách hàng — mặc định khi đăng ký trên website', isLocked: false },
] as const;

// Khóa metadata dùng chung cho @Auth() và PermissionsGuard (đặt ở đây để tránh import vòng).
export const PERMS_KEY = 'permissions';
