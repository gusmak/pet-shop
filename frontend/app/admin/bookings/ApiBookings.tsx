'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { formatVnd } from '@/lib/demo';

// Dữ liệu thật từ database (GET /api/admin/bookings) — hiện chỉ xem, chưa thao tác.
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
  notes: string | null;
}

interface ApiList {
  items: ApiBooking[];
  total: number;
  counts: Record<string, number>;
}

const STATUS: Record<string, { label: string; badge: string; stat: string }> = {
  pending: { label: 'Chờ xác nhận', badge: 'bg-yellow-100 text-yellow-800', stat: 'text-yellow-600' },
  confirmed: { label: 'Đã xác nhận', badge: 'bg-blue-100 text-blue-800', stat: 'text-blue-600' },
  in_progress: { label: 'Đang thực hiện', badge: 'bg-indigo-100 text-indigo-800', stat: 'text-indigo-600' },
  completed: { label: 'Hoàn thành', badge: 'bg-green-100 text-green-800', stat: 'text-green-600' },
  cancelled: { label: 'Đã hủy', badge: 'bg-red-100 text-red-800', stat: 'text-red-600' },
  no_show: { label: 'Không đến', badge: 'bg-gray-100 text-gray-800', stat: 'text-gray-600' },
};

const inputCls =
  'px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent';

export default function ApiBookings() {
  const [search, setSearch] = useState('');
  const [date, setDate] = useState('');
  const [status, setStatus] = useState('');
  const [data, setData] = useState<ApiList | null>(null);
  const [error, setError] = useState('');

  // Chờ 300ms sau lần gõ cuối để không gọi API mỗi phím.
  useEffect(() => {
    let cancelled = false;
    const timer = setTimeout(async () => {
      const qs = new URLSearchParams();
      if (search.trim()) qs.set('q', search.trim());
      if (date) qs.set('date', date);
      if (status) qs.set('status', status);
      const res = await api.get<ApiList>(`/api/admin/bookings?${qs}`);
      if (cancelled) return;
      if (res.data) {
        setData(res.data);
        setError('');
      } else {
        setError(res.error || 'Không tải được danh sách');
      }
    }, 300);
    return () => {
      cancelled = true;
      clearTimeout(timer);
    };
  }, [search, date, status]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý đặt lịch</h1>
        <p className="text-gray-600">Danh sách lịch hẹn của khách hàng (chỉ xem)</p>
      </div>

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-6">
        {Object.entries(STATUS).map(([key, v]) => (
          <div key={key} className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
            <div className="text-sm text-gray-600 mb-1">{v.label}</div>
            <div className={`text-3xl font-bold ${v.stat}`}>{data?.counts[key] ?? 0}</div>
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
            {Object.entries(STATUS).map(([k, v]) => (
              <option key={k} value={k}>{v.label}</option>
            ))}
          </select>
        </div>
      </div>

      {error && (
        <div role="alert" className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Mã booking', 'Khách hàng', 'Thú cưng', 'Dịch vụ', 'Ngày giờ', 'Tổng tiền', 'Trạng thái'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {data?.items.map((b) => {
                const st = STATUS[b.status] ?? { label: b.status, badge: 'bg-gray-100 text-gray-800' };
                return (
                  <tr key={b.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4 text-sm font-mono text-gray-900 whitespace-nowrap">{b.bookingNumber}</td>
                    <td className="px-6 py-4 text-sm text-gray-900">
                      <div>{b.customer}</div>
                      <div className="text-xs text-gray-500">{b.phone}</div>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{b.pet}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">
                      {b.service}
                      {b.notes && (
                        <div className="text-xs text-gray-400 max-w-[220px] truncate" title={b.notes}>
                          Ghi chú: {b.notes}
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">
                      <div>{b.date.split('-').reverse().join('/')}</div>
                      <div className="text-xs text-gray-500">{b.time}</div>
                    </td>
                    <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">{formatVnd(b.total)}</td>
                    <td className="px-6 py-4">
                      <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold whitespace-nowrap ${st.badge}`}>
                        {st.label}
                      </span>
                    </td>
                  </tr>
                );
              })}
              {data && data.items.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">Chưa có lịch hẹn nào</td>
                </tr>
              )}
              {!data && !error && (
                <tr>
                  <td colSpan={7} className="px-6 py-12 text-center text-gray-500">Đang tải...</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
        {data && <div className="px-6 py-3 text-xs text-gray-500 border-t border-gray-100">Tổng: {data.total} lịch hẹn</div>}
      </div>
    </div>
  );
}
