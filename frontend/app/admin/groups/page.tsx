'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { api } from '@/lib/api';
import { DEMO_MODE, readAccounts, writeAccounts, type DemoAccount } from '@/lib/demo';
import {
  GROUPS,
  PERMISSIONS,
  ROLE_LABELS,
  getGroupPermissions,
  setGroupPermissions,
  type Permission,
  type Role,
} from '@/lib/permissions';

const inputCls =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent';

const EMPTY = { name: '', email: '', password: '', role: 'monitor' as Role };

type PermissionRow = { key: string; label: string };

function PermissionMatrix({
  rows,
  groups,
  perms,
  onToggle,
  saving,
}: {
  rows: PermissionRow[];
  groups: { key: string; label: string; memberCount?: number; locked?: boolean }[];
  perms: (groupKey: string) => string[];
  onToggle: (groupKey: string, permKey: string) => void;
  saving?: string | null;
}) {
  return (
    <table className="w-full">
      <thead className="bg-gray-50 border-b border-gray-200">
        <tr>
          <th className="px-6 py-4 text-left text-sm font-semibold text-gray-900">Quyền</th>
          {groups.map((g) => (
            <th key={g.key} className="px-6 py-4 text-center text-sm font-semibold text-gray-900">
              <div>{g.label}</div>
              {g.memberCount !== undefined && (
                <div className="text-xs font-normal text-gray-500">{g.memberCount} tài khoản</div>
              )}
              {g.locked && <div className="text-xs font-normal text-gray-500">🔒 cố định</div>}
            </th>
          ))}
        </tr>
      </thead>
      <tbody className="divide-y divide-gray-200">
        {rows.map((p) => (
          <tr key={p.key}>
            <td className="px-6 py-3 text-sm text-gray-800">{p.label}</td>
            {groups.map((g) => (
              <td key={g.key} className="px-6 py-3 text-center">
                <input
                  type="checkbox"
                  checked={perms(g.key).includes(p.key)}
                  disabled={g.locked || saving === g.key}
                  onChange={() => onToggle(g.key, p.key)}
                  aria-label={`${g.label}: ${p.label}`}
                />
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}

// ─────────────────────────────────────────────
// Chế độ demo: nhóm + tài khoản lưu localStorage
// ─────────────────────────────────────────────
function DemoGroups() {
  const { user } = useAuth();
  const [accounts, setAccounts] = useState<DemoAccount[]>(() => readAccounts());
  const [perms, setPerms] = useState<Record<Role, Permission[]>>(() => ({
    admin: getGroupPermissions('admin'),
    monitor: getGroupPermissions('monitor'),
    customer: getGroupPermissions('customer'),
  }));
  const [form, setForm] = useState(EMPTY);
  const [error, setError] = useState('');

  const persist = (next: DemoAccount[]) => {
    setAccounts(next);
    writeAccounts(next);
  };

  const togglePerm = (groupKey: string, key: string) => {
    const group = groupKey as Role;
    const perm = key as Permission;
    const next = perms[group].includes(perm) ? perms[group].filter((p) => p !== perm) : [...perms[group], perm];
    setPerms({ ...perms, [group]: next });
    setGroupPermissions(group, next);
  };

  const changeGroup = (id: string, role: Role) =>
    persist(accounts.map((a) => (a.id === id ? { ...a, role } : a)));

  const remove = (a: DemoAccount) => {
    if (confirm(`Xóa tài khoản ${a.email}?`)) persist(accounts.filter((x) => x.id !== a.id));
  };

  const add = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    if (accounts.some((a) => a.email.toLowerCase() === form.email.toLowerCase())) {
      return setError('Email đã được sử dụng');
    }
    persist([...accounts, { id: crypto.randomUUID(), ...form }]);
    setForm(EMPTY);
  };

  const countIn = (g: Role) => accounts.filter((a) => a.role === g).length;

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nhóm & phân quyền</h1>
        <p className="text-gray-600">Mỗi tài khoản thuộc đúng một nhóm; quyền được cấp theo nhóm.</p>
      </div>

      {/* Ma trận quyền */}
      <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
        <PermissionMatrix
          rows={PERMISSIONS.map((p) => ({ key: p.key, label: p.label }))}
          groups={GROUPS.map((g) => ({ key: g.id, label: g.label, memberCount: countIn(g.id), locked: g.locked }))}
          perms={(key) => perms[key as Role] ?? []}
          onToggle={togglePerm}
        />
        <p className="px-6 py-3 text-xs text-gray-500 border-t border-gray-100">
          Nhóm Admin luôn có toàn quyền. Thay đổi quyền áp dụng ngay cho các tài khoản đang đăng nhập.
        </p>
      </section>

      {/* Tài khoản */}
      <section>
        <h2 className="text-xl font-bold text-gray-900 mb-4">Tài khoản</h2>

        <form onSubmit={add} className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6 grid sm:grid-cols-5 gap-3 items-end">
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Họ tên</label>
            <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Email</label>
            <input required type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Mật khẩu</label>
            <input required minLength={6} type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} className={inputCls} />
          </div>
          <div>
            <label className="block text-xs font-semibold text-gray-600 mb-1">Nhóm</label>
            <select value={form.role} onChange={(e) => setForm({ ...form, role: e.target.value as Role })} className={inputCls}>
              {GROUPS.map((g) => (
                <option key={g.id} value={g.id}>{ROLE_LABELS[g.id]}</option>
              ))}
            </select>
          </div>
          <button type="submit" className="bg-primary-600 hover:bg-primary-700 text-white px-4 py-2 rounded-lg font-semibold">
            ➕ Thêm
          </button>
          {error && <p className="sm:col-span-5 text-sm text-red-600">{error}</p>}
        </form>

        <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Tài khoản', 'Email', 'Nhóm'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{h}</th>
                ))}
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {accounts.map((a) => {
                const locked = a.isSuper;
                return (
                  <tr key={a.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">
                      {a.name}
                      {a.isSuper && <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Super Admin</span>}
                      {a.id === user?.id && <span className="ml-2 text-xs text-gray-500">(bạn)</span>}
                    </td>
                    <td className="px-6 py-4 text-sm text-gray-600">{a.email}</td>
                    <td className="px-6 py-4">
                      <select
                        value={a.role}
                        disabled={locked || a.id === user?.id}
                        onChange={(e) => changeGroup(a.id, e.target.value as Role)}
                        className="px-3 py-1 border border-gray-300 rounded-lg text-sm disabled:bg-gray-50"
                        title={locked ? 'Super admin không thể đổi nhóm' : a.id === user?.id ? 'Không thể tự đổi nhóm của mình' : undefined}
                      >
                        {GROUPS.map((g) => (
                          <option key={g.id} value={g.id}>{ROLE_LABELS[g.id]}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-6 py-4 text-right">
                      {!locked && a.id !== user?.id && (
                        <button onClick={() => remove(a)} className="text-red-600 hover:text-red-700 font-medium text-sm">
                          Xóa
                        </button>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      </section>
    </div>
  );
}

// ─────────────────────────────────────────────
// Chế độ thật: đọc/ghi qua /api/admin/groups
// ─────────────────────────────────────────────
interface GroupRow {
  key: string;
  name: string;
  description: string | null;
  isLocked: boolean;
  memberCount: number;
  permissions: string[];
}

interface GroupsPayload {
  groups: GroupRow[];
  permissions: { key: string; label: string }[];
}

function ApiGroups() {
  const [payload, setPayload] = useState<GroupsPayload | null>(null);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.get<GroupsPayload>('/api/admin/groups');
      if (cancelled) return;
      if (res.data) setPayload(res.data);
      else setError(res.error || 'Không tải được danh sách nhóm');
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const toggle = async (groupKey: string, permKey: string) => {
    if (!payload) return;
    const group = payload.groups.find((g) => g.key === groupKey);
    if (!group || group.isLocked) return;

    const next = group.permissions.includes(permKey)
      ? group.permissions.filter((p) => p !== permKey)
      : [...group.permissions, permKey];

    setSaving(groupKey);
    const res = await api.put<GroupsPayload>(`/api/admin/groups/${groupKey}/permissions`, { permissions: next });
    setSaving(null);

    if (res.data) {
      setPayload(res.data);
      setError('');
    } else {
      setError(res.error || 'Không thể lưu thay đổi quyền');
    }
  };

  if (!payload && !error) {
    return <div className="py-32 text-center text-gray-500">Đang tải...</div>;
  }

  return (
    <div className="space-y-10">
      <div>
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Nhóm & phân quyền</h1>
        <p className="text-gray-600">
          Quyền được tra ở backend mỗi request — thay đổi có hiệu lực ngay với tài khoản đang đăng nhập.
        </p>
      </div>

      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {payload && (
        <section className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-x-auto">
          <PermissionMatrix
            rows={payload.permissions}
            groups={payload.groups.map((g) => ({
              key: g.key,
              label: g.name,
              memberCount: g.memberCount,
              locked: g.isLocked,
            }))}
            perms={(key) => payload.groups.find((g) => g.key === key)?.permissions ?? []}
            onToggle={toggle}
            saving={saving}
          />
          <p className="px-6 py-3 text-xs text-gray-500 border-t border-gray-100">
            Nhóm Admin luôn có toàn quyền. Nhóm Customer chỉ được cấp quyền <code>account.view</code>.
          </p>
        </section>
      )}
    </div>
  );
}

export default function GroupsPage() {
  return DEMO_MODE ? <DemoGroups /> : <ApiGroups />;
}