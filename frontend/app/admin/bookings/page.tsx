'use client';

import { useState } from 'react';
import { usePersistedState } from '@/lib/usePersistedState';
import { useAuth } from '@/lib/useAuth';
import ApiBookings from './ApiBookings';
import {
  DEMO_MODE,
  INITIAL_BOOKINGS,
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  formatVnd,
  type BookingStatus,
  type DemoBooking,
} from '@/lib/demo';

const NEXT_ACTIONS: Record<BookingStatus, { to: BookingStatus; label: string; cls: string }[]> = {
  pending: [
    { to: 'confirmed', label: 'Xác nhận', cls: 'text-blue-600 hover:text-blue-700' },
    { to: 'cancelled', label: 'Hủy', cls: 'text-red-600 hover:text-red-700' },
  ],
  confirmed: [
    { to: 'completed', label: 'Hoàn thành', cls: 'text-green-600 hover:text-green-700' },
    { to: 'cancelled', label: 'Hủy', cls: 'text-red-600 hover:text-red-700' },
  ],
  completed: [],
  cancelled: [],
};

const STAT_COLORS: Record<BookingStatus, string> = {
  pending: 'text-yellow-600',
  confirmed: 'text-blue-600',
  completed: 'text-green-600',
  cancelled: 'text-red-600',
};

function DemoBookings() {
  const [bookings, setBookings] = usePersistedState<DemoBooking[]>('demo.bookings', INITIAL_BOOKINGS);
  const canEdit = useAuth().can('bookings.manage'); // nhóm chỉ có bookings.view thì chỉ xem
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');

  const q = search.trim().toLowerCase();
  const filtered = bookings.filter(
    (b) =>
      (!q || [b.bookingNumber, b.customer, b.phone, b.pet].some((v) => v.toLowerCase().includes(q))) &&
      (!date || b.date === date) &&
      (!status || b.status === status),
  );

  const setBookingStatus = (id: string, next: BookingStatus) =>
    setBookings((prev) => prev.map((b) => (b.id === id ? { ...b, status: next } : b)));

  const inputCls =
    'px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent';

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý đặt lịch</h1>
        <p className="text-gray-600">
          {canEdit ? 'Theo dõi và quản lý các lịch hẹn của khách hàng' : 'Xem lịch hẹn của khách hàng (chỉ đọc)'}
        </p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
        {(Object.keys(BOOKING_STATUS_LABELS) as BookingStatus[]).map((s) => (
          <div key={s} className="bg-white rounded-xl p-6 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">{BOOKING_STATUS_LABELS[s]}</div>
            <div className={`text-3xl font-bold ${STAT_COLORS[s]}`}>{bookings.filter((b) => b.status === s).length}</div>
          </div>
        ))}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm theo mã, tên khách, SĐT, thú cưng..."
            className={`flex-1 min-w-[200px] ${inputCls}`}
          />
          <input type="date" value={date} onChange={(e) => setDate(e.target.value)} className={inputCls} />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls}>
            <option value="">Tất cả trạng thái</option>
            {Object.entries(BOOKING_STATUS_LABELS).map(([k, v]) => (
              <option key={k} value={k}>{v}</option>
            ))}
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Mã booking', 'Khách hàng', 'Thú cưng', 'Dịch vụ', 'Ngày giờ', 'Tổng tiền', 'Trạng thái'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">{h}</th>
                ))}
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((b) => (
                <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-mono text-gray-900 whitespace-nowrap">{b.bookingNumber}</td>
                  <td className="px-6 py-4 text-sm text-gray-900">
                    <div>{b.customer}</div>
                    <div className="text-xs text-gray-500">{b.phone}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{b.pet}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{b.service}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                    <div>{b.date}</div>
                    <div className="text-xs text-gray-500">{b.time}</div>
                  </td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">{formatVnd(b.total)}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${BOOKING_STATUS_COLORS[b.status]}`}>
                      {BOOKING_STATUS_LABELS[b.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                      {canEdit && NEXT_ACTIONS[b.status].map((a) => (
                        <button
                          key={a.to}
                          onClick={() => setBookingStatus(b.id, a.to)}
                          className={`font-medium text-sm ${a.cls}`}
                        >
                          {a.label}
                        </button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                    Không có lịch hẹn phù hợp
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// Chế độ demo dùng dữ liệu trình duyệt; còn lại đọc từ database qua API.
export default function AdminBookingsPage() {
  return DEMO_MODE ? <DemoBookings /> : <ApiBookings />;
}
