'use client';

import Link from 'next/link';
import { usePersistedState } from '@/lib/usePersistedState';
import { useAuth } from '@/lib/useAuth';
import {
  INITIAL_BOOKINGS,
  INITIAL_SERVICES,
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  formatVnd,
  type DemoBooking,
  type DemoService,
} from '@/lib/demo';

export default function AdminDashboard() {
  const { can } = useAuth();
  const [bookings] = usePersistedState<DemoBooking[]>('demo.bookings', INITIAL_BOOKINGS);
  const [services] = usePersistedState<DemoService[]>('demo.services', INITIAL_SERVICES);

  const revenue = bookings.filter((b) => b.status === 'completed').reduce((s, b) => s + b.total, 0);
  const pending = bookings.filter((b) => b.status === 'pending').length;

  const stats = [
    { label: 'Tổng đặt lịch', value: String(bookings.length), icon: '📅' },
    { label: 'Chờ xác nhận', value: String(pending), icon: '⏳' },
    // Doanh thu và dịch vụ chỉ hiện cho nhóm có quyền dashboard.revenue.
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
        <p className="text-gray-600">Chào mừng đến với trang quản trị PetShop</p>
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
                    {b.service} — {b.date} {b.time}
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
