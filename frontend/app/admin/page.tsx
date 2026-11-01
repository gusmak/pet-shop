'use client';

import Link from 'next/link';
import { useEffect, useState } from 'react';
import { usePersistedState } from '@/lib/usePersistedState';
import { useAuth } from '@/lib/useAuth';
import { api } from '@/lib/api';
import {
  DEMO_MODE,
  INITIAL_BOOKINGS,
  INITIAL_SERVICES,
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  formatVnd,
  type DemoBooking,
  type DemoService,
} from '@/lib/demo';

// Trạng thái booking phía backend (chữ thường) — khớp /api/admin/bookings.
const API_STATUS: Record<string, { label: string; badge: string }> = {
  pending: { label: 'Chờ xác nhận', badge: 'bg-yellow-100 text-yellow-800' },
  confirmed: { label: 'Đã xác nhận', badge: 'bg-blue-100 text-blue-800' },
  in_progress: { label: 'Đang thực hiện', badge: 'bg-indigo-100 text-indigo-800' },
  completed: { label: 'Hoàn thành', badge: 'bg-green-100 text-green-800' },
  cancelled: { label: 'Đã hủy', badge: 'bg-red-100 text-red-800' },
  no_show: { label: 'Không đến', badge: 'bg-gray-100 text-gray-800' },
};

interface ApiBooking {
  id: string;
  bookingNumber: string;
  customer: string;
  phone: string;
  pet: string;
  service: string;
  date: string;
  time: string;
  status: string;
  total: number;
}

interface ApiStats {
  totalBookings: number;
  pending: number;
  counts: Record<string, number>;
  revenue?: number;
  activeServices?: number;
  recent: ApiBooking[];
}

const fmtDate = (d: string) => d.split('-').reverse().join('/');

// ────────────────────────────────────────────────────────────
// Chế độ demo: số liệu từ localStorage, không gọi server.
// ────────────────────────────────────────────────────────────
function DemoDashboard() {
  const { can, user } = useAuth();
  const [bookings] = usePersistedState<DemoBooking[]>('demo.bookings', INITIAL_BOOKINGS);
  const [services] = usePersistedState<DemoService[]>('demo.services', INITIAL_SERVICES);

  const revenue = bookings.filter((b) => b.status === 'completed').reduce((s, b) => s + b.total, 0);
  const pending = bookings.filter((b) => b.status === 'pending').length;

  const stats = [
    { label: 'Tổng đặt lịch', value: String(bookings.length), icon: '📅' },
    { label: 'Chờ xác nhận', value: String(pending), icon: '⏳' },
    ...(can('dashboard.revenue')
      ? [
          { label: 'Doanh thu (đã hoàn thành)', value: formatVnd(revenue), icon: '💰' },
          { label: 'Dịch vụ đang hoạt động', value: String(services.filter((s) => s.isActive).length), icon: '💼' },
        ]
      : []),
  ];

  const recent = [...bookings].sort((a, b) => b.bookingNumber.localeCompare(a.bookingNumber)).slice(0, 5);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tổng quan</h1>
        <p className="text-gray-600">
          {user ? `Chào mừng ${user.name} đến với trang quản trị PetShop` : 'Chào mừng đến với trang quản trị PetShop'}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl mb-4">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Đặt lịch gần đây</h2>
          <Link href="/admin/bookings" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Xem tất cả →
          </Link>
        </div>
        {recent.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">📅</div>
            <p>Chưa có dữ liệu đặt lịch</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recent.map((b) => (
              <li key={b.id} className="py-3 flex items-center justify-between gap-4">
                <div>
                  <div className="font-medium text-gray-900">
                    {b.customer} · {b.pet}
                  </div>
                  <div className="text-sm text-gray-500">
                    {b.service} — {fmtDate(b.date)} {b.time}
                  </div>
                </div>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${BOOKING_STATUS_COLORS[b.status]}`}>
                  {BOOKING_STATUS_LABELS[b.status]}
                </span>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

// ────────────────────────────────────────────────────────────
// Chạy thật: số liệu từ GET /api/admin/stats.
// ────────────────────────────────────────────────────────────
function ApiDashboard() {
  const { can, user } = useAuth();
  const [data, setData] = useState<ApiStats | null>(null);
  const [error, setError] = useState('');

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.get<ApiStats>('/api/admin/stats');
      if (cancelled) return;
      if (res.data) {
        setData(res.data);
        setError('');
      } else {
        setError(res.error || 'Không tải được số liệu tổng quan');
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const stats = [
    { label: 'Tổng đặt lịch', value: String(data?.totalBookings ?? 0), icon: '📅' },
    { label: 'Chờ xác nhận', value: String(data?.pending ?? 0), icon: '⏳' },
    ...(can('dashboard.revenue')
      ? [
          { label: 'Doanh thu (đã hoàn thành)', value: formatVnd(data?.revenue ?? 0), icon: '💰' },
          { label: 'Dịch vụ đang hoạt động', value: String(data?.activeServices ?? 0), icon: '💼' },
        ]
      : []),
  ];

  const recent = data?.recent ?? [];

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Tổng quan</h1>
        <p className="text-gray-600">
          {user ? `Chào mừng ${user.name} đến với trang quản trị PetShop` : 'Chào mừng đến với trang quản trị PetShop'}
        </p>
      </div>

      {error && (
        <div role="alert" className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        {stats.map((stat) => (
          <div key={stat.label} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-3xl mb-4">{stat.icon}</div>
            <div className="text-2xl font-bold text-gray-900 mb-1">{stat.value}</div>
            <div className="text-sm text-gray-600">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between mb-6">
          <h2 className="text-xl font-bold text-gray-900">Đặt lịch gần đây</h2>
          <Link href="/admin/bookings" className="text-sm font-medium text-primary-600 hover:text-primary-700">
            Xem tất cả →
          </Link>
        </div>
        {!data && !error ? (
          <div className="text-center py-12 text-gray-500">Đang tải...</div>
        ) : recent.length === 0 ? (
          <div className="text-center py-12 text-gray-500">
            <div className="text-5xl mb-4">📅</div>
            <p>Chưa có dữ liệu đặt lịch</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {recent.map((b) => {
              const st = API_STATUS[b.status] ?? { label: b.status, badge: 'bg-gray-100 text-gray-800' };
              return (
                <li key={b.id} className="py-3 flex items-center justify-between gap-4">
                  <div>
                    <div className="font-medium text-gray-900">
                      {b.customer} · {b.pet}
                    </div>
                    <div className="text-sm text-gray-500">
                      {b.service} — {fmtDate(b.date)} {b.time}
                    </div>
                  </div>
                  <span className={`px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${st.badge}`}>
                    {st.label}
                  </span>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
}

// Chế độ demo dùng dữ liệu trình duyệt; còn lại đọc từ database qua API.
export default function AdminDashboard() {
  return DEMO_MODE ? <DemoDashboard /> : <ApiDashboard />;
}