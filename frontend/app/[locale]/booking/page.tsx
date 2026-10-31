"use client";

import { useEffect, useRef, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Calendar, User, PawPrint, Scissors, Bath, Heart, CheckCircle, Check, type LucideIcon } from "lucide-react";
import { DEMO_MODE, addDemoBooking } from "@/lib/demo";
import { useAuth } from "@/lib/useAuth";
import { api } from "@/lib/api";

interface BookingResponse {
  bookingNumber: string;
  date: string;
  time: string;
}

interface Svc {
  slug: string;
  name: string;
  category: string;
  minutes: number;
  prices: Record<string, number>;
  base?: number;
}

const CATEGORY_ICONS: Record<string, LucideIcon> = {
  "spa-tam": Bath,
  "cat-tia-grooming": Scissors,
  "cham-soc-dac-biet": Heart,
};

// Dữ liệu không dịch của các dịch vụ (tên lấy từ catalog theo slug).
const FALLBACK_META: { slug: string; category: string; minutes: number; prices: Record<string, number> }[] = [
  { slug: "tam-ve-sinh-co-ban", category: "spa-tam", minutes: 60, prices: { toy: 150000, small: 200000, medium: 250000, large: 300000 } },
  { slug: "tam-spa-cao-cap", category: "spa-tam", minutes: 90, prices: { toy: 250000, small: 300000, medium: 380000, large: 450000 } },
  { slug: "cat-tia-long-co-ban", category: "cat-tia-grooming", minutes: 90, prices: { toy: 200000, small: 280000, medium: 350000, large: 400000 } },
  { slug: "cat-tia-tao-kieu-nghe-thuat", category: "cat-tia-grooming", minutes: 120, prices: { toy: 350000, small: 450000, medium: 550000, large: 600000 } },
  { slug: "ve-sinh-rang-mieng", category: "cham-soc-dac-biet", minutes: 30, prices: { toy: 180000, small: 180000, medium: 180000, large: 180000 } },
  { slug: "vat-tuyen-hoi", category: "cham-soc-dac-biet", minutes: 15, prices: { toy: 100000, small: 100000, medium: 100000, large: 100000 } },
];

interface ApiService {
  slug: string;
  name: string;
  basePrice: number;
  duration: number;
  category: { slug: string };
  variants: { size: string; price: number }[];
}

export default function BookingPage() {
  const locale = useLocale();
  const t = useTranslations("bookingPage");
  const cat = useTranslations("catalog");
  const time = useTranslations("common.time");

  const buildFallback = (): Svc[] =>
    FALLBACK_META.map((m) => ({ ...m, name: cat(`services.${m.slug}.name`) }));

  const [formData, setFormData] = useState({
    fullName: "",
    phone: "",
    email: "",
    petName: "",
    petType: "dog",
    petSize: "small",
    date: "",
    time: "",
    notes: "",
  });

  const { user } = useAuth();
  const [services, setServices] = useState<Svc[]>(buildFallback());
  const [selected, setSelected] = useState<string[]>([]);

  // Chọn sẵn dịch vụ khi vào từ /services hoặc /pricing (?service=<slug>).
  useEffect(() => {
    const svc = new URLSearchParams(window.location.search).get("service");
    if (!svc) return;
    const id = setTimeout(() => setSelected([svc]), 0);
    return () => clearTimeout(id);
  }, []);

  // Chạy thật: lấy dịch vụ + giá từ database.
  useEffect(() => {
    if (DEMO_MODE) return;
    let cancelled = false;
    (async () => {
      const res = await api.get<ApiService[]>("/api/services");
      if (cancelled || !res.data?.length) return;
      setServices(
        res.data.map((s) => ({
          slug: s.slug,
          name: s.name,
          category: s.category.slug,
          minutes: s.duration,
          prices: Object.fromEntries(s.variants.map((v) => [v.size.toLowerCase(), v.price])),
          base: s.basePrice,
        })),
      );
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const formatPrice = (n: number) => n.toLocaleString(locale === "vi" ? "vi-VN" : "en-US") + "đ";
  const formatDuration = (minutes: number) =>
    minutes >= 60
      ? `${Math.floor(minutes / 60)} ${time("hour")}${minutes % 60 ? ` ${minutes % 60} ${time("minute")}` : ""}`
      : `${minutes} ${time("minute")}`;

  const sizeLabels: Record<string, string> = {
    toy: t("sizes.toy"),
    small: t("sizes.small"),
    medium: t("sizes.medium"),
    large: t("sizes.large"),
  };

  const priceOf = (svc: Svc) => svc.prices[formData.petSize] ?? svc.base ?? 0;
  const chosen = services.filter((s) => selected.includes(s.slug));
  const totalPrice = chosen.reduce((sum, s) => sum + priceOf(s), 0);
  const totalMinutes = chosen.reduce((sum, s) => sum + s.minutes, 0);

  const toggleService = (svc: Svc) =>
    setSelected((prev) =>
      prev.includes(svc.slug)
        ? prev.filter((slug) => slug !== svc.slug)
        : [...prev.filter((slug) => services.find((s) => s.slug === slug)?.category !== svc.category), svc.slug],
    );

  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");
  const [submitted, setSubmitted] = useState<{ code: string; date: string; time: string } | null>(null);

  // Đặt min cho ô ngày sau khi mount (giờ local).
  const dateRef = useRef<HTMLInputElement>(null);
  useEffect(() => {
    const d = new Date();
    const pad = (n: number) => String(n).padStart(2, "0");
    if (dateRef.current) dateRef.current.min = `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
  }, []);

  const timeSlots = ["08:00", "09:00", "10:00", "11:00", "13:00", "14:00", "15:00", "16:00", "17:00", "18:00"];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (chosen.length === 0) {
      setError(t("errorNoService"));
      return;
    }
    setError("");

    if (DEMO_MODE) {
      const booking = addDemoBooking({
        customer: formData.fullName,
        phone: formData.phone,
        pet: formData.petName,
        service: chosen.map((s) => s.name).join(", "),
        date: formData.date,
        time: formData.time,
        total: totalPrice,
        userId: user?.role === "customer" ? user.id : undefined,
      });
      setSubmitted({ code: booking.bookingNumber, date: formData.date, time: formData.time });
      window.scrollTo({ top: 0, behavior: "smooth" });
      return;
    }

    setSubmitting(true);
    const res = await api.post<BookingResponse>("/api/bookings", {
      customerName: formData.fullName,
      customerPhone: formData.phone,
      customerEmail: formData.email || undefined,
      petName: formData.petName,
      petSpecies: formData.petType,
      petSize: formData.petSize,
      services: chosen.map((s) => s.slug),
      date: formData.date,
      time: formData.time,
      notes: formData.notes || undefined,
    });
    setSubmitting(false);

    if (!res.data) {
      setError(res.error || t("errorGeneric"));
      return;
    }
    setSubmitted({ code: res.data.bookingNumber, date: formData.date, time: formData.time });
    window.scrollTo({ top: 0, behavior: "smooth" });
  };

  if (submitted) {
    return (
      <div className="py-20 bg-gradient-to-br from-primary-50 via-white to-primary-50">
        <div className="max-w-xl mx-auto px-4 text-center bg-white rounded-2xl shadow-xl p-8 sm:p-12">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-6" />
          <h1 className="text-3xl font-bold text-gray-900 mb-3">{t("successTitle")}</h1>
          {submitted.code && (
            <p className="text-gray-600 mb-2">
              {t("successCode")}: <span className="font-mono font-semibold text-gray-900">{submitted.code}</span>
            </p>
          )}
          <p className="text-gray-600 mb-8">
            {submitted.time} · {submitted.date.split("-").reverse().join("/")} — {t("successBody")}
          </p>
          <div className="flex flex-col sm:flex-row gap-3 justify-center">
            <button
              onClick={() => {
                setSubmitted(null);
                setFormData({ ...formData, date: "", time: "", notes: "" });
                setSelected([]);
              }}
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-full font-semibold"
            >
              {t("bookAnother")}
            </button>
            <Link href="/" className="border-2 border-gray-200 hover:bg-gray-50 text-gray-700 px-6 py-3 rounded-full font-semibold">
              {t("backHome")}
            </Link>
          </div>
        </div>
      </div>
    );
  }

  const inputCls =
    "w-full px-4 py-3 border-2 border-gray-200 rounded-lg focus:border-primary-500 focus:ring-0 transition-colors min-h-[48px]";

  return (
    <div className="py-12 bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-12 animate-fadeIn">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">{t("title")}</h1>
          <p className="text-xl text-gray-600">{t("subtitle")}</p>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="bg-white rounded-2xl shadow-xl p-4 sm:p-6 lg:p-8 space-y-6 sm:space-y-8">
          {/* Customer Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <User className="w-6 h-6 text-primary-600" />
              {t("customerInfo")}
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("fullName")} *</label>
                <input
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={(e) => setFormData({ ...formData, fullName: e.target.value })}
                  className={inputCls}
                  placeholder="Nguyễn Văn A"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("phone")} *</label>
                <input
                  type="tel"
                  required
                  value={formData.phone}
                  onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                  className={inputCls}
                  placeholder="0912 345 678"
                />
              </div>
              <div className="md:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("email")}</label>
                <input
                  type="email"
                  value={formData.email}
                  onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                  className={inputCls}
                  placeholder="email@example.com"
                />
              </div>
            </div>
          </div>

          {/* Pet Info */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <PawPrint className="w-6 h-6 text-primary-600" />
              {t("petInfo")}
            </h2>
            <div className="grid sm:grid-cols-2 md:grid-cols-3 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("petName")} *</label>
                <input
                  type="text"
                  required
                  value={formData.petName}
                  onChange={(e) => setFormData({ ...formData, petName: e.target.value })}
                  className={inputCls}
                  placeholder="Mimi"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("petType")} *</label>
                <select
                  value={formData.petType}
                  onChange={(e) => setFormData({ ...formData, petType: e.target.value })}
                  className={inputCls}
                >
                  <option value="dog">{t("petTypeDog")}</option>
                  <option value="cat">{t("petTypeCat")}</option>
                  <option value="other">{t("petTypeOther")}</option>
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("petSize")} *</label>
                <select
                  value={formData.petSize}
                  onChange={(e) => setFormData({ ...formData, petSize: e.target.value })}
                  className={inputCls}
                >
                  <option value="toy">{sizeLabels.toy}</option>
                  <option value="small">{sizeLabels.small}</option>
                  <option value="medium">{sizeLabels.medium}</option>
                  <option value="large">{sizeLabels.large}</option>
                </select>
              </div>
            </div>
          </div>

          {/* Service Selection */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-2 flex items-center gap-2">
              <Scissors className="w-6 h-6 text-primary-600" />
              {t("selectService")} *
            </h2>
            <p className="text-sm text-gray-500 mb-6">
              {t("selectServiceHint")}{" "}
              <span className="font-medium text-gray-700">{sizeLabels[formData.petSize]}</span>.
            </p>
            <div className="grid md:grid-cols-2 gap-4">
              {services.map((service) => {
                const Icon = CATEGORY_ICONS[service.category] ?? Scissors;
                const checked = selected.includes(service.slug);
                return (
                  <label
                    key={service.slug}
                    className={`relative border-2 rounded-lg p-4 cursor-pointer transition-all hover:border-primary-500 ${
                      checked ? "border-primary-500 bg-primary-50" : "border-gray-200"
                    }`}
                  >
                    <input type="checkbox" checked={checked} onChange={() => toggleService(service)} className="sr-only" />
                    <div className="flex items-start gap-3">
                      <div className="bg-primary-100 p-2 rounded-lg">
                        <Icon className="w-6 h-6 text-primary-600" />
                      </div>
                      <div className="flex-1">
                        <div className="font-semibold text-gray-900">{service.name}</div>
                        <div className="text-sm text-gray-600 mt-1">{formatDuration(service.minutes)}</div>
                        <div className="text-lg font-bold text-primary-600 mt-2">{formatPrice(priceOf(service))}</div>
                      </div>
                      <span
                        className={`flex h-6 w-6 shrink-0 items-center justify-center rounded-full border-2 ${
                          checked ? "border-primary-600 bg-primary-600 text-white" : "border-gray-300"
                        }`}
                        aria-hidden
                      >
                        {checked && <Check className="h-4 w-4" strokeWidth={3} />}
                      </span>
                    </div>
                  </label>
                );
              })}
            </div>

            {chosen.length > 0 && (
              <div className="mt-6 rounded-xl border border-primary-200 bg-primary-50 p-5">
                <div className="font-semibold text-gray-900 mb-3">
                  {t("selectedServices")} ({chosen.length})
                </div>
                <ul className="space-y-1.5 text-sm text-gray-700">
                  {chosen.map((s) => (
                    <li key={s.slug} className="flex justify-between gap-4">
                      <span>{s.name}</span>
                      <span className="font-medium">{formatPrice(priceOf(s))}</span>
                    </li>
                  ))}
                </ul>
                <div className="mt-4 flex items-end justify-between border-t border-primary-200 pt-3">
                  <span className="text-sm text-gray-600">
                    {t("estimated")} {formatDuration(totalMinutes)}
                  </span>
                  <span className="text-xl font-extrabold text-primary-600">
                    <span className="mr-2 text-sm font-medium text-gray-500">{t("subtotal")}</span>
                    {formatPrice(totalPrice)}
                  </span>
                </div>
              </div>
            )}
          </div>

          {/* Date & Time */}
          <div>
            <h2 className="text-2xl font-bold text-gray-900 mb-6 flex items-center gap-2">
              <Calendar className="w-6 h-6 text-primary-600" />
              {t("dateTime")} *
            </h2>
            <div className="grid sm:grid-cols-2 gap-4 sm:gap-6">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("date")} *</label>
                <input
                  ref={dateRef}
                  type="date"
                  required
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-2">{t("time")} *</label>
                <select
                  required
                  value={formData.time}
                  onChange={(e) => setFormData({ ...formData, time: e.target.value })}
                  className={inputCls}
                >
                  <option value="">{t("chooseTime")}</option>
                  {timeSlots.map((slot) => (
                    <option key={slot} value={slot}>
                      {slot}
                    </option>
                  ))}
                </select>
              </div>
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="block text-sm font-semibold text-gray-700 mb-2">{t("notes")}</label>
            <textarea
              value={formData.notes}
              onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
              rows={4}
              className={inputCls}
              placeholder={t("notesPlaceholder")}
            />
          </div>

          {/* Payment Info */}
          <div className="bg-blue-50 border-2 border-blue-200 rounded-lg p-6">
            <h3 className="font-bold text-blue-900 mb-2">💡 {t("paymentInfo")}</h3>
            <p className="text-blue-800 text-sm">{t("paymentNote")}</p>
          </div>

          {/* Submit */}
          {error && (
            <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
              {error}
            </div>
          )}
          <button
            type="submit"
            disabled={submitting}
            className="w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-4 rounded-lg transition-all hover:scale-[1.02] shadow-lg disabled:opacity-50 disabled:hover:scale-100"
          >
            {submitting ? t("submitting") : t("submit")}
          </button>
        </form>
      </div>
    </div>
  );
}