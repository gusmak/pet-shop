"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.PERMS_KEY = exports.GROUP_DEFS = exports.DEFAULT_GROUP_PERMISSIONS = exports.PERMISSIONS = void 0;
exports.PERMISSIONS = [
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
];
exports.DEFAULT_GROUP_PERMISSIONS = {
    admin: exports.PERMISSIONS.map((p) => p.key),
    monitor: ['admin.access', 'bookings.view', 'posts.write', 'account.view'],
    customer: ['account.view'],
};
exports.GROUP_DEFS = [
    { key: 'admin', name: 'Nhóm Admin', description: 'Quản trị viên — toàn quyền hệ thống', isLocked: true },
    { key: 'monitor', name: 'Nhóm Monitor', description: 'Nhân viên (staff) — theo dõi lịch đặt và đăng bài', isLocked: false },
    { key: 'customer', name: 'Nhóm Customer', description: 'Khách hàng — mặc định khi đăng ký trên website', isLocked: false },
];
exports.PERMS_KEY = 'permissions';
//# sourceMappingURL=permissions.js.map