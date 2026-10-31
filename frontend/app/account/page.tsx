'use client';

import { useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth, type AuthUser } from '@/lib/useAuth';
import { usePersistedState } from '@/lib/usePersistedState';
import { ROLE_LABELS } from '@/lib/permissions';
import {
  INITIAL_BOOKINGS,
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  formatVnd,
  type DemoBooking,
} from '@/lib/demo';

// Chỉ render sau khi đã xác định user ở client (đọc localStorage an toàn, không lệch hydration).
function BookingHistory({ user }: { user: AuthUser }) {
  const [bookings] = usePersistedState<DemoBooking[]>('demo.bookings', INITIAL_BOOKINGS);
  const mine = bookings.filter((b) => b.userId === user.id);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">Lịch sử đặt lịch</h2>
      {mine.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="mb-4">Bạn chưa có lịch hẹn nào.</p>
          <Link href="/booking" className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full font-semibold">
            Đặt lịch ngay
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {mine.map((b) => (
            <li key={b.id} className="py-4 flex flex-wrap items-center justify-between gap-3">
              <div>
                <div className="font-semibold text-gray-900">
                  {b.service} · {b.pet}
                </div>
                <div className="text-sm text-gray-500">
                  {b.date.split('-').reverse().join('/')} lúc {b.time} — <span className="font-mono">{b.bookingNumber}</span>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <span className="font-semibold text-gray-900">{formatVnd(b.total)}</span>
                <span className={`px-3 py-1 rounded-full text-xs font-semibold ${BOOKING_STATUS_COLORS[b.status]}`}>
                  {BOOKING_STATUS_LABELS[b.status]}
                </span>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default function AccountPage() {
  const router = useRouter();
  const { user, loading, logout, can } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace('/login');
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="py-32 text-center text-gray-500">Đang tải...</div>;
  }

  return (
    <div className="py-12 bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600 text-sm">
              {user.email}
              {user.phone ? ` · ${user.phone}` : ''}
            </p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
              Nhóm {ROLE_LABELS[user.role]}
            </span>
          </div>
          <div className="flex gap-3">
            {can('admin.access') && (
              <Link href="/admin" className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold">
                Vào trang quản trị
              </Link>
            )}
            <button
              onClick={() => {
                logout();
                router.push('/');
              }}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              Đăng xuất
            </button>
          </div>
        </div>

        <BookingHistory user={user} />

        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/services" className="bg-white rounded-2xl shadow p-5 hover:shadow-lg transition-shadow">
            <div className="font-bold text-gray-900">Xem dịch vụ</div>
            <div className="text-sm text-gray-600">Danh sách dịch vụ spa & grooming</div>
          </Link>
          <Link href="/pricing" className="bg-white rounded-2xl shadow p-5 hover:shadow-lg transition-shadow">
            <div className="font-bold text-gray-900">Bảng giá</div>
            <div className="text-sm text-gray-600">Giá theo kích thước thú cưng</div>
          </Link>
        </div>
      </div>
    </div>
  );
}