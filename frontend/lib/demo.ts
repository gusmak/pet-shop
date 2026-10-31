// Chế độ demo: chạy hoàn toàn trên trình duyệt, không cần backend/DB.
// Bật bằng NEXT_PUBLIC_DEMO_MODE=true (xem frontend/.env.local).
export const DEMO_MODE = process.env.NEXT_PUBLIC_DEMO_MODE === 'true';

export const DEMO_TOKEN = "demo-token";

import type { Role } from "./permissions";

export interface DemoUser {
  id: string;
  email: string;
  name: string;
  role: Role; // id nhóm của tài khoản
  phone?: string;
  position?: string;
  storeId?: string;
  storeName?: string;
  isSuper?: boolean; // super admin: không đổi nhóm, không xóa được
}

export type DemoAccount = DemoUser & { password: string };

// Tài khoản tạo sẵn. admin@petshop.vn là super admin mặc định.
export const DEMO_ACCOUNTS: DemoAccount[] = [
  { id: "demo-admin", email: "admin@petshop.vn", password: "admin123", name: "Super Admin", role: "admin", isSuper: true, position: "ADMIN", storeId: "store-1", storeName: "Cửa hàng chính" },
  { id: "demo-staff", email: "monitor@petshop.vn", password: "monitor123", name: "Nhân viên Lễ tân", role: "monitor", position: "RECEPTIONIST", storeId: "store-1", storeName: "Cửa hàng chính" },
  { id: "demo-customer", email: "khach@petshop.vn", password: "khach123", name: "Nguyễn Văn A", role: "customer", phone: "0912 345 678" },
];

const ACCOUNTS_KEY = "demo.accounts";

// Kho tài khoản demo (localStorage). Super admin luôn tồn tại và luôn thuộc nhóm admin.
export function readAccounts(): DemoAccount[] {
  let list: DemoAccount[] = [];
  try {
    list = JSON.parse(localStorage.getItem(ACCOUNTS_KEY) || "null") ?? [];
  } catch {
    // dữ liệu hỏng — dùng mặc định
  }
  const extra = list.filter((a) => !DEMO_ACCOUNTS.some((d) => d.id === a.id));
  const seeded = DEMO_ACCOUNTS.map((d) => {
    const saved = list.find((a) => a.id === d.id);
    return d.isSuper ? d : { ...d, ...saved };
  });
  return [...seeded, ...extra];
}

export function writeAccounts(list: DemoAccount[]) {
  localStorage.setItem(ACCOUNTS_KEY, JSON.stringify(list));
  window.dispatchEvent(new Event("auth-change"));
}

export interface DemoPost {
  id: string;
  title: string;
  excerpt: string;
  content: string;
  authorId: string;
  authorName: string;
  createdAt: string; // yyyy-mm-dd
  published: boolean;
}

export const INITIAL_POSTS: DemoPost[] = [
  { id: "p1", title: "5 mẹo giữ lông chó luôn mượt mà", excerpt: "Chải lông đúng cách, chọn sữa tắm phù hợp và chế độ ăn là chìa khóa.", content: "Chải lông mỗi ngày giúp loại bỏ lông rụng và phân bổ dầu tự nhiên.\n\nChọn sữa tắm theo loại da, tắm 2-4 tuần một lần, và bổ sung omega-3 trong khẩu phần ăn.", authorId: "demo-admin", authorName: "Quản trị viên", createdAt: "2026-10-20", published: true },
  { id: "p2", title: "Khi nào nên đưa mèo đi spa?", excerpt: "Không phải bé mèo nào cũng cần tắm thường xuyên — vậy khi nào là phù hợp?", content: "Mèo tự liếm lông nên ít khi cần tắm. Hãy đưa bé đi spa khi lông bết dính, có mùi, hoặc bác sĩ khuyên dùng dầu gội dược liệu.", authorId: "demo-staff", authorName: "Nhân viên Lễ tân", createdAt: "2026-10-25", published: true },
];

export type BookingStatus = 'pending' | 'confirmed' | 'completed' | 'cancelled';

export interface DemoBooking {
  id: string;
  bookingNumber: string;
  customer: string;
  phone: string;
  pet: string;
  service: string;
  date: string;
  time: string;
  status: BookingStatus;
  total: number;
  userId?: string; // tài khoản khách đã đặt (nếu đăng nhập)
}

export interface DemoService {
  id: string;
  name: string;
  category: string;
  price: number;
  duration: string;
  isActive: boolean;
}

export const SERVICE_CATEGORIES = ['Spa & Tắm', 'Cắt tỉa & Grooming', 'Chăm sóc đặc biệt'];

export const BOOKING_STATUS_LABELS: Record<BookingStatus, string> = {
  pending: 'Chờ xác nhận',
  confirmed: 'Đã xác nhận',
  completed: 'Hoàn thành',
  cancelled: 'Đã hủy',
};

export const BOOKING_STATUS_COLORS: Record<BookingStatus, string> = {
  pending: 'bg-yellow-100 text-yellow-800',
  confirmed: 'bg-blue-100 text-blue-800',
  completed: 'bg-green-100 text-green-800',
  cancelled: 'bg-red-100 text-red-800',
};

export const INITIAL_SERVICES: DemoService[] = [
  { id: '1', name: 'Tắm vệ sinh cơ bản', category: 'Spa & Tắm', price: 150000, duration: '45-60 phút', isActive: true },
  { id: '2', name: 'Tắm spa cao cấp', category: 'Spa & Tắm', price: 250000, duration: '60-90 phút', isActive: true },
  { id: '3', name: 'Cắt tỉa lông cơ bản', category: 'Cắt tỉa & Grooming', price: 200000, duration: '60-90 phút', isActive: true },
  { id: '4', name: 'Cắt tỉa tạo kiểu nghệ thuật', category: 'Cắt tỉa & Grooming', price: 350000, duration: '90-120 phút', isActive: true },
  { id: '5', name: 'Vệ sinh răng miệng', category: 'Chăm sóc đặc biệt', price: 180000, duration: '30 phút', isActive: true },
  { id: '6', name: 'Vắt tuyến hôi', category: 'Chăm sóc đặc biệt', price: 100000, duration: '15 phút', isActive: false },
];

export const INITIAL_BOOKINGS: DemoBooking[] = [
  { id: '1', bookingNumber: 'BK-20261029-0001', customer: 'Nguyễn Văn A', phone: '0912 345 678', pet: 'Mimi', service: 'Tắm spa cao cấp', date: '2026-10-29', time: '10:00', status: 'confirmed', total: 250000, userId: 'demo-customer' },
  { id: '2', bookingNumber: 'BK-20261029-0002', customer: 'Trần Thị B', phone: '0987 654 321', pet: 'Lucky', service: 'Cắt tỉa lông cơ bản', date: '2026-10-29', time: '14:00', status: 'pending', total: 200000 },
  { id: '3', bookingNumber: 'BK-20261028-0003', customer: 'Lê Văn C', phone: '0909 123 456', pet: 'Bông', service: 'Vệ sinh răng miệng', date: '2026-10-28', time: '09:00', status: 'completed', total: 180000, userId: 'demo-customer' },
  { id: '4', bookingNumber: 'BK-20261028-0004', customer: 'Phạm Thu D', phone: '0933 111 222', pet: 'Đậu', service: 'Cắt tỉa tạo kiểu nghệ thuật', date: '2026-10-30', time: '15:00', status: 'pending', total: 350000 },
  { id: '5', bookingNumber: 'BK-20261027-0005', customer: 'Đỗ Minh E', phone: '0977 888 999', pet: 'Kitty', service: 'Tắm vệ sinh cơ bản', date: '2026-10-27', time: '11:00', status: 'cancelled', total: 150000 },
];

export const formatVnd = (n: number) => n.toLocaleString('vi-VN') + 'đ';

// Form đặt lịch công khai ghi vào cùng kho dữ liệu demo để admin thấy ngay.
export function addDemoBooking(
  input: Pick<DemoBooking, 'customer' | 'phone' | 'pet' | 'service' | 'date' | 'time' | 'total' | 'userId'>,
): DemoBooking {
  let list: DemoBooking[];
  try {
    const raw = localStorage.getItem('demo.bookings');
    list = raw ? (JSON.parse(raw) as DemoBooking[]) : INITIAL_BOOKINGS;
  } catch {
    list = INITIAL_BOOKINGS;
  }
  const stamp = new Date().toISOString().slice(0, 10).replace(/-/g, '');
  const booking: DemoBooking = {
    ...input,
    id: crypto.randomUUID(),
    bookingNumber: `BK-${stamp}-${String(list.length + 1).padStart(4, '0')}`,
    status: 'pending',
  };
  try {
    localStorage.setItem('demo.bookings', JSON.stringify([booking, ...list]));
  } catch {
    // bỏ qua nếu storage bị chặn
  }
  return booking;
}
