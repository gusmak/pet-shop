export declare const PERMISSIONS: readonly [{
    readonly key: "admin.access";
    readonly label: "Vào khu quản trị";
}, {
    readonly key: "dashboard.revenue";
    readonly label: "Xem doanh thu & số liệu dịch vụ";
}, {
    readonly key: "bookings.view";
    readonly label: "Xem lịch đặt";
}, {
    readonly key: "bookings.manage";
    readonly label: "Xác nhận / hoàn thành / hủy lịch";
}, {
    readonly key: "posts.write";
    readonly label: "Viết bài và sửa/xóa bài của mình";
}, {
    readonly key: "posts.manage_all";
    readonly label: "Sửa/xóa bài của mọi người";
}, {
    readonly key: "services.manage";
    readonly label: "Quản lý dịch vụ";
}, {
    readonly key: "customers.view";
    readonly label: "Xem khách hàng";
}, {
    readonly key: "staff.manage";
    readonly label: "Quản lý nhân viên";
}, {
    readonly key: "groups.manage";
    readonly label: "Quản lý nhóm & tài khoản";
}, {
    readonly key: "settings.manage";
    readonly label: "Quản lý cấu hình hệ thống";
}, {
    readonly key: "account.view";
    readonly label: "Xem tài khoản & lịch sử đặt lịch của mình";
}];
export type PermissionKey = (typeof PERMISSIONS)[number]['key'];
export declare const DEFAULT_GROUP_PERMISSIONS: Record<string, PermissionKey[]>;
export declare const GROUP_DEFS: readonly [{
    readonly key: "admin";
    readonly name: "Nhóm Admin";
    readonly description: "Quản trị viên — toàn quyền hệ thống";
    readonly isLocked: true;
}, {
    readonly key: "monitor";
    readonly name: "Nhóm Monitor";
    readonly description: "Nhân viên (staff) — theo dõi lịch đặt và đăng bài";
    readonly isLocked: false;
}, {
    readonly key: "customer";
    readonly name: "Nhóm Customer";
    readonly description: "Khách hàng — mặc định khi đăng ký trên website";
    readonly isLocked: false;
}];
export declare const PERMS_KEY = "permissions";
