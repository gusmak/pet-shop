'use client';

import { useCallback, useEffect, useState } from 'react';
import { api } from '@/lib/api';
import { DEMO_MODE } from '@/lib/demo';

interface Message {
  id: string;
  name: string;
  email: string;
  phone: string | null;
  subject: string;
  message: string;
  isRead: boolean;
  createdAt: string;
}

const fmt = (iso: string) => new Date(iso).toLocaleString('vi-VN');

export default function AdminContactPage() {
  const [rows, setRows] = useState<Message[] | null>(null);
  const [error, setError] = useState('');
  const [unreadOnly, setUnreadOnly] = useState(false);
  const [open, setOpen] = useState<string | null>(null);

  const load = useCallback(async (onlyUnread: boolean) => {
    const res = await api.get<Message[]>(`/api/admin/contact${onlyUnread ? '?unread=1' : ''}`);
    if (res.data) {
      setRows(res.data);
      setError('');
    } else setError(res.error || 'Không tải được tin nhắn');
  }, []);

  useEffect(() => {
    if (DEMO_MODE) return;
    let cancelled = false;
    (async () => {
      const res = await api.get<Message[]>(`/api/admin/contact${unreadOnly ? '?unread=1' : ''}`);
      if (cancelled) return;
      if (res.data) {
        setRows(res.data);
        setError('');
      } else setError(res.error || 'Không tải được tin nhắn');
    })();
    return () => {
      cancelled = true;
    };
  }, [unreadOnly]);

  const setRead = async (m: Message, isRead: boolean) => {
    const res = await api.patch(`/api/admin/contact/${m.id}`, { isRead });
    if (!res.data) setError(res.error || 'Không thể cập nhật');
    else await load(unreadOnly);
  };

  const toggle = (m: Message) => {
    const next = open === m.id ? null : m.id;
    setOpen(next);
    if (next && !m.isRead) void setRead(m, true); // mở xem = đã đọc
  };

  if (DEMO_MODE) {
    return <p className="text-gray-600">Chế độ demo — tin nhắn liên hệ chỉ có khi kết nối backend thật.</p>;
  }

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Tin nhắn liên hệ</h1>
          <p className="text-gray-600">Tin khách gửi từ form liên hệ trên website.</p>
        </div>
        <label className="flex items-center gap-2 text-sm text-gray-700">
          <input type="checkbox" checked={unreadOnly} onChange={(e) => setUnreadOnly(e.target.checked)} />
          Chỉ hiện tin chưa đọc
        </label>
      </div>

      {error && (
        <div role="alert" className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 divide-y divide-gray-100">
        {rows === null && !error && <p className="p-8 text-center text-gray-500">Đang tải...</p>}
        {rows?.length === 0 && <p className="p-8 text-center text-gray-500">Không có tin nhắn nào.</p>}
        {rows?.map((m) => (
          <div key={m.id} className={m.isRead ? '' : 'bg-primary-50/40'}>
            <button onClick={() => toggle(m)} className="w-full text-left px-6 py-4 flex items-start justify-between gap-4">
              <div className="min-w-0">
                <div className="flex items-center gap-2">
                  {!m.isRead && <span className="h-2 w-2 shrink-0 rounded-full bg-primary-600" aria-label="Chưa đọc" />}
                  <span className={`truncate ${m.isRead ? 'text-gray-700' : 'font-semibold text-gray-900'}`}>{m.subject}</span>
                </div>
                <div className="text-sm text-gray-500 truncate">
                  {m.name} · {m.email}
                  {m.phone ? ` · ${m.phone}` : ''}
                </div>
              </div>
              <span className="shrink-0 text-xs text-gray-500">{fmt(m.createdAt)}</span>
            </button>
            {open === m.id && (
              <div className="px-6 pb-5 space-y-3">
                <p className="whitespace-pre-wrap text-gray-800">{m.message}</p>
                <div className="flex gap-3 text-sm">
                  <a href={`mailto:${m.email}?subject=${encodeURIComponent('Re: ' + m.subject)}`} className="text-primary-600 hover:text-primary-700 font-medium">
                    Trả lời qua email
                  </a>
                  {m.phone && (
                    <a href={`tel:${m.phone}`} className="text-primary-600 hover:text-primary-700 font-medium">
                      Gọi {m.phone}
                    </a>
                  )}
                  {m.isRead && (
                    <button onClick={() => setRead(m, false)} className="text-gray-500 hover:text-gray-700">
                      Đánh dấu chưa đọc
                    </button>
                  )}
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
