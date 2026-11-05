"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { api } from "@/lib/api";
import { useStore } from "@/lib/store";
import { buildTimeSlots, nowHHmm, todayLocal } from "@/lib/slots";
import { formatVnd } from "@/lib/demo";

interface ApiBooking {
  id: string;
  bookingNumber: string;
  pet: string;
  service: string;
  services: { name: string; price: number }[];
  date: string;
  time: string;
  endTime: string;
  status: string;
  total: number;
  notes: string | null;
}

const STATUS_COLORS: Record<string, string> = {
  pending: "bg-yellow-100 text-yellow-800",
  confirmed: "bg-blue-100 text-blue-800",
  in_progress: "bg-indigo-100 text-indigo-800",
  completed: "bg-green-100 text-green-800",
  cancelled: "bg-red-100 text-red-800",
  no_show: "bg-gray-100 text-gray-700",
};

const fmtDate = (d: string) => d.split("-").reverse().join("/");

function RebookModal({ booking, onClose, onDone }: { booking: ApiBooking; onClose: () => void; onDone: (code: string) => void }) {
  const t = useTranslations("accountPage");
  const store = useStore();
  const today = useMemo(() => todayLocal(), []);
  const [date, setDate] = useState("");
  const [time, setTime] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  const slots = useMemo(() => {
    if (!store) return [];
    const all = buildTimeSlots(store.openTime, store.closeTime);
    return date === today ? all.filter((s) => s > nowHHmm()) : all;
  }, [store, date, today]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setSaving(true);
    const res = await api.post<{ bookingNumber: string }>(`/api/bookings/${booking.id}/rebook`, { date, time });
    setSaving(false);
    if (!res.data) return setError(res.error || t("loadFailed"));
    onDone(res.data.bookingNumber);
  };

  const cls = "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:outline-none min-h-[48px]";

  return (
    <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={onClose}>
      <form onSubmit={submit} onClick={(e) => e.stopPropagation()} className="bg-white rounded-2xl shadow-xl w-full max-w-md p-6 space-y-4">
        <h2 className="text-xl font-bold text-gray-900">{t("rebookTitle")}</h2>
        <p className="text-sm text-gray-600">{t("rebookIntro")}</p>

        <dl className="rounded-xl bg-gray-50 p-4 text-sm space-y-2">
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">{t("pet")}</dt>
            <dd className="font-semibold text-gray-900">{booking.pet}</dd>
          </div>
          <div className="flex justify-between gap-4">
            <dt className="text-gray-500">{t("services")}</dt>
            <dd className="font-semibold text-gray-900 text-right">{booking.service}</dd>
          </div>
        </dl>
        <p className="text-xs text-gray-500">{t("rebookPriceNote")}</p>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t("date")}</label>
            <input
              required
              type="date"
              min={today}
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setTime("");
              }}
              className={cls}
            />
          </div>
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-1">{t("time")}</label>
            <select required value={time} onChange={(e) => setTime(e.target.value)} disabled={!date} className={cls}>
              <option value="">{t("selectTime")}</option>
              {slots.map((s) => (
                <option key={s} value={s}>
                  {s}
                </option>
              ))}
            </select>
          </div>
        </div>
        {date && slots.length === 0 && <p className="text-sm text-amber-700">{t("noSlots")}</p>}

        {error && (
          <p role="alert" className="text-sm text-red-600">
            {error}
          </p>
        )}

        <div className="flex justify-end gap-3 pt-2">
          <button type="button" onClick={onClose} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
            {t("close")}
          </button>
          <button type="submit" disabled={saving || !date || !time} className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-50">
            {saving ? t("rebooking") : t("confirmRebook")}
          </button>
        </div>
      </form>
    </div>
  );
}

// Lịch sử đặt lịch lấy từ database (/api/bookings/me), cho phép đặt lại / hủy.
export default function BookingHistory() {
  const t = useTranslations("accountPage");
  const [rows, setRows] = useState<ApiBooking[] | null>(null);
  const [error, setError] = useState("");
  const [notice, setNotice] = useState("");
  const [rebooking, setRebooking] = useState<ApiBooking | null>(null);

  const load = useCallback(async () => {
    const res = await api.get<ApiBooking[]>("/api/bookings/me");
    if (res.data) {
      setRows(res.data);
      setError("");
    } else setError(res.error || t("loadFailed"));
  }, [t]);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const res = await api.get<ApiBooking[]>("/api/bookings/me");
      if (cancelled) return;
      if (res.data) setRows(res.data);
      else setError(res.error || t("loadFailed"));
    })();
    return () => {
      cancelled = true;
    };
  }, [t]);

  const cancel = async (b: ApiBooking) => {
    if (!confirm(t("cancelConfirm", { code: b.bookingNumber }))) return;
    const res = await api.patch(`/api/bookings/${b.id}/cancel`, {});
    if (!res.data) return setError(res.error || t("cancelFailed"));
    setNotice("");
    await load();
  };

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{t("bookingHistory")}</h2>

      {notice && (
        <div role="status" className="mb-4 bg-green-50 border border-green-200 text-green-800 px-4 py-3 rounded-lg text-sm">
          {notice}
        </div>
      )}
      {error && (
        <div role="alert" className="mb-4 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      {rows === null && !error ? (
        <p className="py-8 text-center text-gray-500">{t("loading")}</p>
      ) : rows && rows.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="mb-4">{t("noBookings")}</p>
          <Link href="/booking" className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full font-semibold">
            {t("bookNow")}
          </Link>
        </div>
      ) : (
        <ul className="divide-y divide-gray-100">
          {rows?.map((b) => {
            const active = b.status === "pending" || b.status === "confirmed";
            return (
              <li key={b.id} className="py-4 space-y-3">
                <div className="flex flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="font-semibold text-gray-900">
                      {b.service} · {b.pet}
                    </div>
                    <div className="text-sm text-gray-500">
                      {b.time} · {fmtDate(b.date)} — <span className="font-mono">{b.bookingNumber}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="font-semibold text-gray-900">{formatVnd(b.total)}</span>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${STATUS_COLORS[b.status] ?? "bg-gray-100 text-gray-700"}`}>
                      {t(`status.${b.status}` as "status.pending")}
                    </span>
                  </div>
                </div>
                <div className="flex gap-3">
                  <button onClick={() => setRebooking(b)} className="px-4 py-1.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white text-sm font-semibold">
                    {t("rebook")}
                  </button>
                  {active && (
                    <button onClick={() => cancel(b)} className="px-4 py-1.5 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50 text-sm">
                      {t("cancelBooking")}
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      )}

      {rebooking && (
        <RebookModal
          booking={rebooking}
          onClose={() => setRebooking(null)}
          onDone={(code) => {
            setRebooking(null);
            setNotice(t("rebookDone", { code }));
            setError("");
            void load();
          }}
        />
      )}
    </div>
  );
}
