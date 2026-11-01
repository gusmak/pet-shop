'use client';

import { useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DEMO_MODE } from '@/lib/demo';

interface StoreSettings {
  name: string;
  address: string;
  phone: string;
  email: string | null;
  zaloLink: string | null;
  openTime: string;
  closeTime: string;
  slotCapacity: number;
}

interface SettingsForm {
  name: string;
  address: string;
  phone: string;
  email: string;
  zaloLink: string;
  openTime: string;
  closeTime: string;
  slotCapacity: number;
}

const inputCls =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent';

function DemoSettings() {
  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cấu hình hệ thống</h1>
        <p className="text-gray-600">Giờ mở cửa, hotline, Zalo và thông tin cửa hàng.</p>
      </div>
      <div className="bg-amber-50 border border-amber-200 text-amber-800 text-sm px-4 py-3 rounded-lg mb-6">
        Chế độ demo — cấu hình hệ thống chỉ chỉnh được khi kết nối backend thật.
      </div>
      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 text-gray-600 space-y-1">
        <p>Giờ mở cửa: 08:00 – 20:00</p>
        <p>Hotline: 0971616634</p>
        <p>Zalo: zalo.me/0971616634</p>
      </div>
    </div>
  );
}

function ApiSettings() {
  const [form, setForm] = useState<SettingsForm>({
    name: '',
    address: '',
    phone: '',
    email: '',
    zaloLink: '',
    openTime: '08:00',
    closeTime: '20:00',
    slotCapacity: 3,
  });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [message, setMessage] = useState<{ ok: boolean; text: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.get<StoreSettings>('/api/admin/settings');
      if (cancelled) return;
      if (res.data) {
        setForm({
          name: res.data.name,
          address: res.data.address,
          phone: res.data.phone,
          email: res.data.email ?? '',
          zaloLink: res.data.zaloLink ?? '',
          openTime: res.data.openTime,
          closeTime: res.data.closeTime,
          slotCapacity: res.data.slotCapacity,
        });
      } else {
        setMessage({ ok: false, text: res.error || 'Không tải được cấu hình' });
      }
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const set = <K extends keyof SettingsForm>(key: K, value: SettingsForm[K]) =>
    setForm((f) => ({ ...f, [key]: value }));

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setSaving(true);
    setMessage(null);

    const res = await api.patch<StoreSettings>('/api/admin/settings', {
      name: form.name,
      address: form.address,
      phone: form.phone,
      email: form.email.trim() || null,
      zaloLink: form.zaloLink.trim() || null,
      openTime: form.openTime,
      closeTime: form.closeTime,
      slotCapacity: Number(form.slotCapacity),
    });
    setSaving(false);

    if (!res.data) {
      setMessage({ ok: false, text: res.error || 'Không thể lưu cấu hình' });
      return;
    }
    setForm({
      name: res.data.name,
      address: res.data.address,
      phone: res.data.phone,
      email: res.data.email ?? '',
      zaloLink: res.data.zaloLink ?? '',
      openTime: res.data.openTime,
      closeTime: res.data.closeTime,
      slotCapacity: res.data.slotCapacity,
    });
    setMessage({ ok: true, text: 'Đã lưu cấu hình' });
  };

  return (
    <div>
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-2">Cấu hình hệ thống</h1>
        <p className="text-gray-600">Giờ mở cửa, hotline, Zalo và thông tin cửa hàng hiển thị trên website.</p>
      </div>

      {message && (
        <div
          role="status"
          className={`mb-6 px-4 py-3 rounded-lg text-sm ${
            message.ok ? 'bg-green-50 border border-green-200 text-green-700' : 'bg-red-50 border border-red-200 text-red-700'
          }`}
        >
          {message.text}
        </div>
      )}

      <form onSubmit={submit} className="bg-white rounded-xl shadow-sm border border-gray-200 p-6 space-y-6">
        <div className="grid sm:grid-cols-2 gap-5">
          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Tên cửa hàng *</label>
            <input required value={form.name} onChange={(e) => set('name', e.target.value)} className={inputCls} />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Địa chỉ *</label>
            <input required value={form.address} onChange={(e) => set('address', e.target.value)} className={inputCls} />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Số điện thoại hotline *</label>
            <input required value={form.phone} onChange={(e) => set('phone', e.target.value)} className={inputCls} placeholder="0971 616 634" />
          </div>

          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">Email</label>
            <input type="email" value={form.email} onChange={(e) => set('email', e.target.value)} className={inputCls} placeholder="info@petshop.vn" />
          </div>

          <div className="sm:col-span-2">
            <label className="block text-sm font-semibold text-gray-700 mb-1">Zalo link</label>
            <input value={form.zaloLink} onChange={(e) => set('zaloLink', e.target.value)} className={inputCls} placeholder="https://zalo.me/0971616634" />
            <p className="text-xs text-gray-400 mt-1">Đường link Zalo để khách bấm liên hệ.</p>
          </div>
        </div>

        <div className="border-t border-gray-100 pt-6">
          <h2 className="text-lg font-bold text-gray-900 mb-4">Giờ hoạt động & đặt lịch</h2>
          <div className="grid sm:grid-cols-3 gap-5">
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Giờ mở cửa *</label>
              <input required type="time" value={form.openTime} onChange={(e) => set('openTime', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Giờ đóng cửa *</label>
              <input required type="time" value={form.closeTime} onChange={(e) => set('closeTime', e.target.value)} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Số lịch / khung giờ *</label>
              <input
                required
                type="number"
                min={1}
                max={100}
                value={form.slotCapacity}
                onChange={(e) => set('slotCapacity', Number(e.target.value))}
                className={inputCls}
              />
            </div>
          </div>
          <p className="text-xs text-gray-400 mt-3">
            Trang đặt lịch sẽ sinh các khung giờ hẹn từ giờ mở đến giờ đóng cửa, nghỉ trưa 12:00–13:00.
          </p>
        </div>

        <div className="flex justify-end pt-2">
          <button
            type="submit"
            disabled={saving || loading}
            className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-8 py-3 rounded-lg font-semibold transition-colors"
          >
            {saving ? 'Đang lưu...' : 'Lưu cấu hình'}
          </button>
        </div>
      </form>
    </div>
  );
}

export default function SettingsPage() {
  return DEMO_MODE ? <DemoSettings /> : <ApiSettings />;
}