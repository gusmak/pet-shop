'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { api } from '@/lib/api';
import { DEMO_MODE } from '@/lib/demo';
import { ROLE_LABELS, type Role } from '@/lib/permissions';

const inputCls =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent';

const POSITIONS: { value: string; label: string }[] = [
  { value: 'ADMIN', label: 'Quản trị viên' },
  { value: 'MANAGER', label: 'Quản lý' },
  { value: 'GROOMER', label: 'Thợ grooming' },
  { value: 'RECEPTIONIST', label: 'Lễ tân' },
];

const POSITION_LABELS = Object.fromEntries(POSITIONS.map((p) => [p.value, p.label]));

const STAFF_GROUPS: Role[] = ['admin', 'monitor'];

interface StaffRow {
  id: string;
  fullName: string;
  email: string;
  phone: string;
  position: string;
  specialties: string[];
  group: string;
  store: string;
  isActive: boolean;
  isSuper: boolean;
  hireDate: string;
  lastLoginAt: string | null;
}

type StaffForm = {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  group: string;
  position: string;
  specialties: string;
  isActive: boolean;
};

const EMPTY: StaffForm = {
  fullName: '',
  email: '',
  phone: '',
  password: '',
  group: 'monitor',
  position: 'RECEPTIONIST',
  specialties: '',
  isActive: true,
};

const parseSpecialties = (s: string) =>
  s
    .split(',')
    .map((x) => x.trim())
    .filter(Boolean);

// ─────────────────────────────────────────────
// Chế độ demo: danh sách cứng để xem layout
// ─────────────────────────────────────────────
function DemoStaff() {
  const [staff] = useState([
    { id: '1', fullName: 'Phạm Văn D', email: 'phamvand@petshop.vn', phone: '0911222333', position: 'GROOMER', specialties: ['grooming', 'spa'], store: 'Cửa hàng chính', isActive: true, hireDate: '2026-01-15', group: 'monitor', isSuper: false },
    { id: '2', fullName: 'Hoàng Thị E', email: 'hoangthie@petshop.vn', phone: '0922333444', position: 'RECEPTIONIST', specialties: ['booking'], store: 'Cửa hàng chính', isActive: true, hireDate: '2026-03-01', group: 'monitor', isSuper: false },
    { id: '3', fullName: 'Vũ Văn F', email: 'vuvanf@petshop.vn', phone: '0933444555', position: 'MANAGER', specialties: ['management'], store: 'Cửa hàng chính', isActive: true, hireDate: '2025-12-01', group: 'monitor', isSuper: false },
  ]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý nhân viên</h1>
        <p className="text-gray-600">Danh sách nhân viên và phân quyền</p>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Nhân viên', 'Liên hệ', 'Vị trí', 'Chuyên môn', 'Cửa hàng', 'Ngày vào làm'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{h}</th>
                ))}
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staff.map((member) => (
                <tr key={member.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4">
                    <div className="font-medium text-gray-900">{member.fullName}</div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="text-sm text-gray-900">{member.email}</div>
                    <div className="text-sm text-gray-600">{member.phone}</div>
                  </td>
                  <td className="px-6 py-4">
                    <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                      {POSITION_LABELS[member.position]}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap gap-1">
                      {member.specialties.map((spec, idx) => (
                        <span key={idx} className="inline-flex px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                          {spec}
                        </span>
                      ))}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{member.store}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{member.hireDate}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}

// ─────────────────────────────────────────────
// Chế độ thật: CRUD qua /api/admin/staff
// ─────────────────────────────────────────────
function ApiStaff() {
  const { user } = useAuth();
  const [staff, setStaff] = useState<StaffRow[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<StaffRow | null>(null);
  const [form, setForm] = useState<StaffForm>(EMPTY);
  const [formError, setFormError] = useState('');

  const refresh = useCallback(async () => {
    const res = await api.get<StaffRow[]>('/api/admin/staff');
    if (res.data) {
      setStaff(res.data);
      setError('');
    } else {
      setError(res.error || 'Không tải được danh sách nhân viên');
    }
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.get<StaffRow[]>('/api/admin/staff');
      if (cancelled) return;
      if (res.data) setStaff(res.data);
      else setError(res.error || 'Không tải được danh sách nhân viên');
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const openCreate = () => {
    setEditing(null);
    setForm(EMPTY);
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (s: StaffRow) => {
    setEditing(s);
    setForm({
      fullName: s.fullName,
      email: s.email,
      phone: s.phone,
      password: '',
      group: s.group,
      position: s.position,
      specialties: s.specialties.join(', '),
      isActive: s.isActive,
    });
    setFormError('');
    setModalOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    if (editing) {
      // Super admin và chính mình: backend cấm đổi nhóm/khóa, nên không gửi 2 trường này.
      const lockProtected = editing.isSuper || editing.id === user?.id;
      const res = await api.patch(`/api/admin/staff/${editing.id}`, {
        fullName: form.fullName,
        phone: form.phone,
        position: form.position,
        specialties: parseSpecialties(form.specialties),
        ...(lockProtected ? {} : { group: form.group, isActive: form.isActive }),
        ...(form.password ? { password: form.password } : {}),
      });
      setSaving(false);
      if (!res.data) {
        setFormError(res.error || 'Không thể cập nhật nhân viên');
        return;
      }
    } else {
      const res = await api.post('/api/admin/staff', {
        fullName: form.fullName,
        email: form.email,
        phone: form.phone,
        password: form.password,
        group: form.group,
        position: form.position,
        specialties: parseSpecialties(form.specialties),
      });
      setSaving(false);
      if (!res.data) {
        setFormError(res.error || 'Không thể tạo nhân viên');
        return;
      }
    }

    setModalOpen(false);
    await refresh();
  };

  const toggleActive = async (s: StaffRow) => {
    const res = await api.patch(`/api/admin/staff/${s.id}`, { isActive: !s.isActive });
    if (!res.data) alert(res.error || 'Không thể thay đổi trạng thái');
    else await refresh();
  };

  const remove = async (s: StaffRow) => {
    if (!confirm(`Xóa nhân viên "${s.fullName}"?`)) return;
    const res = await api.delete(`/api/admin/staff/${s.id}`);
    if (!res.data) alert(res.error || 'Không thể xóa nhân viên');
    else await refresh();
  };

  const selfId = user?.id;

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý nhân viên</h1>
          <p className="text-gray-600">Danh sách nhân viên nội bộ và phân nhóm (Admin / Monitor)</p>
        </div>
        <button
          onClick={openCreate}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          Thêm nhân viên
        </button>
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
                {['Nhân viên', 'Liên hệ', 'Vị trí', 'Chuyên môn', 'Nhóm', 'Trạng thái', 'Ngày vào làm'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">{h}</th>
                ))}
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {staff.map((s) => {
                const isSelf = s.id === selfId;
                const lockGroup = s.isSuper || isSelf; // không đổi nhóm/khóa super admin và chính mình
                return (
                  <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="font-medium text-gray-900">
                        {s.fullName}
                        {s.isSuper && <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Super Admin</span>}
                        {isSelf && <span className="ml-2 text-xs text-gray-500">(bạn)</span>}
                      </div>
                      <div className="text-xs text-gray-500">{s.store}</div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">{s.email}</div>
                      <div className="text-sm text-gray-600">{s.phone}</div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-3 py-1 rounded-full text-xs font-semibold bg-blue-100 text-blue-800">
                        {POSITION_LABELS[s.position] ?? s.position}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex flex-wrap gap-1">
                        {s.specialties.map((spec, idx) => (
                          <span key={idx} className="inline-flex px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <span className="inline-flex px-2 py-1 rounded text-xs bg-gray-100 text-gray-700">
                        {ROLE_LABELS[s.group as Role] ?? s.group}
                      </span>
                    </td>
                    <td className="px-6 py-4">
                      <span
                        className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                          s.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                        }`}
                      >
                        {s.isActive ? 'Hoạt động' : 'Đã khóa'}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{s.hireDate}</td>
                    <td className="px-6 py-4 text-right">
                      <div className="flex items-center justify-end gap-3 whitespace-nowrap">
                        <button onClick={() => openEdit(s)} className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                          Sửa
                        </button>
                        {!lockGroup && (
                          <button onClick={() => toggleActive(s)} className="text-blue-600 hover:text-blue-700 font-medium text-sm">
                            {s.isActive ? 'Khóa' : 'Mở khóa'}
                          </button>
                        )}
                        {!s.isSuper && !isSelf && (
                          <button onClick={() => remove(s)} className="text-red-600 hover:text-red-700 font-medium text-sm">
                            Xóa
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                );
              })}
              {loading && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">Đang tải...</td>
                </tr>
              )}
              {!loading && staff.length === 0 && (
                <tr>
                  <td colSpan={8} className="px-6 py-12 text-center text-gray-500">Chưa có nhân viên.</td>
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
            <h2 className="text-xl font-bold text-gray-900">{editing ? 'Sửa nhân viên' : 'Thêm nhân viên'}</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Họ tên *</label>
                <input required value={form.fullName} onChange={(e) => setForm({ ...form, fullName: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại *</label>
                <input required type="tel" value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} className={inputCls} placeholder="0912345678" />
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
                <label className="block text-sm font-semibold text-gray-700 mb-1">{editing ? 'Mật khẩu mới (để trống nếu không đổi)' : 'Mật khẩu *'}</label>
                <input
                  type="password"
                  required={!editing}
                  minLength={6}
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nhóm</label>
                <select
                  value={form.group}
                  disabled={editing?.isSuper || editing?.id === selfId}
                  onChange={(e) => setForm({ ...form, group: e.target.value })}
                  className={`${inputCls} disabled:bg-gray-50`}
                >
                  {STAFF_GROUPS.map((g) => (
                    <option key={g} value={g}>{ROLE_LABELS[g]}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Vị trí</label>
                <select value={form.position} onChange={(e) => setForm({ ...form, position: e.target.value })} className={inputCls}>
                  {POSITIONS.map((p) => (
                    <option key={p.value} value={p.value}>{p.label}</option>
                  ))}
                </select>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Chuyên môn (phân tách bằng dấu phẩy)</label>
                <input value={form.specialties} onChange={(e) => setForm({ ...form, specialties: e.target.value })} className={inputCls} placeholder="grooming, spa" />
              </div>
            </div>

            {editing && (
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  disabled={editing.isSuper || editing.id === selfId}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
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

export default function AdminStaffPage() {
  return DEMO_MODE ? <DemoStaff /> : <ApiStaff />;
}