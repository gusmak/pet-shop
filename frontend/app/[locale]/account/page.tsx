"use client";

import { useEffect } from "react";
import NextLink from "next/link";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { useAuth, type AuthUser } from "@/lib/useAuth";
import { usePersistedState } from "@/lib/usePersistedState";
import { ROLE_LABELS } from "@/lib/permissions";
import {
  INITIAL_BOOKINGS,
  BOOKING_STATUS_COLORS,
  BOOKING_STATUS_LABELS,
  formatVnd,
  type DemoBooking,
} from "@/lib/demo";

function BookingHistory({ user }: { user: AuthUser }) {
  const t = useTranslations("accountPage");
  const [bookings] = usePersistedState<DemoBooking[]>("demo.bookings", INITIAL_BOOKINGS);
  const mine = bookings.filter((b) => b.userId === user.id);

  return (
    <div className="bg-white rounded-2xl shadow-lg p-6">
      <h2 className="text-xl font-bold text-gray-900 mb-4">{t("bookingHistory")}</h2>
      {mine.length === 0 ? (
        <div className="text-center py-10 text-gray-500">
          <p className="mb-4">{t("noBookings")}</p>
          <Link href="/booking" className="inline-block bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full font-semibold">
            {t("bookNow")}
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
                  {b.date.split("-").reverse().join("/")} · {b.time} — <span className="font-mono">{b.bookingNumber}</span>
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
  const t = useTranslations("accountPage");
  const router = useRouter();
  const { user, loading, logout, can } = useAuth();

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) {
    return <div className="py-32 text-center text-gray-500">{t("loading")}</div>;
  }

  return (
    <div className="py-12 bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 space-y-6">
        <div className="bg-white rounded-2xl shadow-lg p-6 flex flex-wrap items-center justify-between gap-4">
          <div>
            <h1 className="text-2xl font-bold text-gray-900">{user.name}</h1>
            <p className="text-gray-600 text-sm">
              {user.email}
              {user.phone ? ` · ${user.phone}` : ""}
            </p>
            <span className="inline-block mt-2 px-3 py-1 rounded-full text-xs font-semibold bg-primary-100 text-primary-700">
              {t("group")} {ROLE_LABELS[user.role]}
            </span>
          </div>
          <div className="flex gap-3">
            {can("admin.access") && (
              <NextLink href="/admin" className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold">
                {t("adminPanel")}
              </NextLink>
            )}
            <button
              onClick={() => {
                logout();
                router.push("/");
              }}
              className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50"
            >
              {t("logout")}
            </button>
          </div>
        </div>

        <BookingHistory user={user} />

        <div className="grid sm:grid-cols-2 gap-4">
          <Link href="/services" className="bg-white rounded-2xl shadow p-5 hover:shadow-lg transition-shadow">
            <div className="font-bold text-gray-900">{t("viewServices")}</div>
            <div className="text-sm text-gray-600">{t("viewServicesDesc")}</div>
          </Link>
          <Link href="/pricing" className="bg-white rounded-2xl shadow p-5 hover:shadow-lg transition-shadow">
            <div className="font-bold text-gray-900">{t("pricing")}</div>
            <div className="text-sm text-gray-600">{t("pricingDesc")}</div>
          </Link>
        </div>
      </div>
    </div>
  );
}