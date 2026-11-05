'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { api } from '@/lib/api';
import { DEMO_MODE } from '@/lib/demo';

const inputCls =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent';

interface CustomerRow {
  id: string;
  fullName: string;
  email: string;
  phone: string | null;
  pets: number;
  bookings: number;
  totalSpent: number;
  isActive: boolean;
  createdAt: string;
}

type CustomerForm = { fullName: string; email: string; phone: string; password: string; isActive: boolean };
const EMPTY: CustomerForm = { fullName: '', email: '', phone: '', password: '', isActive: true };

const money = (n: number) => new Intl.NumberFormat('vi-VN').format(n) + 'đ';

// ─────────────────────────────────────────────
// Chế độ demo: danh sách cứng để xem layout
// ─────────────────────────────────────────────
function DemoUsers() {
  const [users] = useState([
    { id: '1', fullName: 'Nguyễn Văn A', email: 'nguyenvana@email.com', phone: '0912345678', pets: 2, bookings: 5, totalSpent: '1.2M', createdAt: '2026-10-01' },
    { id: '2', fullName: 'Trần Thị B', email: 'tranthib@email.com', phone: '0987654321', pets: 1, bookings: 3, totalSpent: '800K', createdAt: '2026-10-05' },
    { id: '3', fullName: 'Lê Văn C', email: 'levanc@email.com', phone: '0909123456', pets: 3, bookings: 8, totalSpent: '2.5M', createdAt: '2026-09-20' },
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý khách hàng</h1>
        <p className="text-gray-600">Danh sách khách hàng đã đăng ký (dữ liệu demo)</p>
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <table className="w-full">
          <thead className="bg-gray-50 border-b border-gray-200">
            <tr>
              {['Khách hàng', 'Liên hệ', 'Thú cưng', 'Lịch đặt', 'Tổng chi', 'Ngày tạo'].map((h) => (
                <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {users.map((u) => (
              <tr key={u.id}>
                <td className="px-6 py-4 font-medium text-gray-900">{u.fullName}</td>
                <td className="px-6 py-4 text-sm text-gray-900">{u.email}<div className="text-gray-600">{u.phone}</div></td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.pets}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.bookings}</td>
                <td className="px-6 py-4 text-sm font-semibold text-gray-900">{u.totalSpent}</td>
                <td className="px-6 py-4 text-sm text-gray-600">{u.createdAt}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Chế độ thật: /api/admin/customers
// ─────────────────────────────────────────────
function ApiUsers() {
  const { permissions } = useAuth();
  const canManage = permissions.includes('groups.manage');

  const [rows, setRows] = useState<CustomerRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [q, setQ] = useState('');
  const [status, setStatus] = useState('');
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<CustomerRow | null>(null);
  const [form, setForm] = useState<CustomerForm>(EMPTY);
  const [formError, setFormError] = useState('');

  const load = useCallback(async (query: string) => {
    const res = await api.get<CustomerRow[]>(`/api/admin/customers${query ? `?q=${encodeURIComponent(query)}` : ''}`);
    if (res.data) {
      setRows(res.data);
      setError('');
    } else {
      setError(res.error || 'Không tải được danh sách khách hàng');
    }
    setLoading(false);
  }, []);

  // Tìm kiếm có debounce
  useEffect(() => {
    const t = setTimeout(() => void load(q.trim()), 300);
    return () => clearTimeout(t);
  }, [q, load]);

  const shown = rows.filter((r) => (status === 'active' ? r.isActive : status === 'inactive' ? !r.isActive : true));

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (r: CustomerRow) => {
    setEditing(r);
    setForm({ fullName: r.fullName, email: r.email, phone: r.phone ?? '', password: '', isActive: r.isActive });
    setFormError('');
    setModalOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);
    const res = editing
      ? await api.patch(`/api/admin/customers/${editing.id}`, {
          fullName: form.fullName,
          ...(form.phone ? { phone: form.phone } : {}),
          isActive: form.isActive,
          ...(form.password ? { password: form.password } : {}),
        })
      : await api.post('/api/admin/customers', {
          fullName: form.fullName,
          email: form.email,
          ...(form.phone ? { phone: form.phone } : {}),
          password: form.password,
        });
    setSaving(false);
    if (!res.data) {
      setFormError(res.error || 'Không thể lưu khách hàng');
      return;
    }
    setModalOpen(false);
    await load(q.trim());
  };

  const toggleActive = async (r: CustomerRow) => {
    const res = await api.patch(`/api/admin/customers/${r.id}`, { isActive: !r.isActive });
    if (!res.data) alert(res.error || 'Không thể thay đổi trạng thái');
    else await load(q.trim());
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý khách hàng</h1>
          <p className="text-gray-600">Khách hàng đã đăng ký (nhóm Customer) — {rows.length} tài khoản</p>
        </div>
        {canManage && (
          <button
            onClick={openCreate}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            Thêm khách hàng
          </button>
        )}
      </div>

      {error && (
        <div role="alert" className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            placeholder="Tìm kiếm theo tên, email, SĐT..."
            className="flex-1 min-w-[200px] px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          />
          <select
            value={status}
            onChange={(e) => setStatus(e.target.value)}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent"
          >
            <option value="">Tất cả trạng thái</option>
            <option value="active">Hoạt động</option>
            <option value="inactive">Đã khóa</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Khách hàng', 'Liên hệ', 'Thú cưng', 'Lịch đặt', 'Tổng chi', 'Trạng thái', 'Ngày tạo'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">{h}</th>
                ))}
                {canManage && <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Thao tác</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {shown.map((r) => (
                <tr key={r.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 font-medium text-gray-900">{r.fullName}</td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{r.email}</div>
                    <div className="text-sm text-gray-600">{r.phone ?? '—'}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.pets}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{r.bookings}</td>
                  <td className="px-6 py-4 text-sm font-semibold text-gray-900 whitespace-nowrap">{money(r.totalSpent)}</td>
                  <td className="px-6 py-4">
                    <span
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        r.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {r.isActive ? 'Hoạt động' : 'Đã khóa'}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{r.createdAt}</td>
                  {canManage && (
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                        <button onClick={() => openEdit(r)} className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                          Sửa
                        </button>
                        <button onClick={() => toggleActive(r)} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                          {r.isActive ? 'Khóa' : 'Mở khóa'}
                        </button>
                      </div>
                    </td>
                  )}
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">Đang tải...</td>
                </tr>
              )}
              {!loading && shown.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">Không có khách hàng nào.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={() => setModalOpen(false)}>
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-900">{editing ? 'Sửa khách hàng' : 'Thêm khách hàng'}</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Họ tên *</label>
                <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại</label>
                <input type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="0912345678" />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Email *</label>
                <input
                  required
                  type="email"
                  value={form.email}
                  disabled={!!editing}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  className={`${inputCls} disabled:bg-gray-50`}
                />
                {editing && <p className="text-xs text-gray-400 mt-1">Email không đổi được sau khi tạo.</p>}
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">
                  {editing ? 'Đặt lại mật khẩu (để trống nếu không đổi)' : 'Mật khẩu *'}
                </label>
                <input
                  type="password"
                  required={!editing}
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={inputCls}
                />
              </div>
            </div>

            {editing && (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Tài khoản đang hoạt động
              </label>
            )}

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                Hủy
              </button>
              <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-50">
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return DEMO_MODE ? <DemoUsers /> : <ApiUsers />;
}
