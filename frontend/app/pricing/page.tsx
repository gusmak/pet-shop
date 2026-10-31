"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Check, Clock, Info, Sparkles, ArrowRight, Phone, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { DEMO_MODE } from "@/lib/demo";

// Giá khớp dữ liệu seed (backend/prisma/seed.ts) — VNĐ, số nguyên.
type Size = "toy" | "small" | "medium" | "large";

interface Service {
  id: string; // slug
  category: string; // slug danh mục
  name: string;
  description: string;
  duration: number; // phút
  emoji: string;
  features: string[];
  prices: Record<Size, number>;
  popular?: boolean;
}

interface Category {
  id: string; // "all" hoặc slug danh mục
  label: string;
  emoji: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  "spa-tam": "🛁",
  "cat-tia-grooming": "✂️",
  "cham-soc-dac-biet": "🩺",
};

const SIZES: { key: Size; label: string; weight: string; emoji: string }[] = [
  { key: "toy", label: "Siêu nhỏ", weight: "dưới 3kg", emoji: "🐹" },
  { key: "small", label: "Nhỏ", weight: "3–10kg", emoji: "🐕" },
  { key: "medium", label: "Vừa", weight: "10–25kg", emoji: "🐩" },
  { key: "large", label: "Lớn", weight: "trên 25kg", emoji: "🐕‍🦺" },
];

const DEMO_CATEGORIES: Category[] = [
  { id: "all", label: "Tất cả", emoji: "🐾" },
  { id: "spa-tam", label: "Spa & Tắm", emoji: "🛁" },
  { id: "cat-tia-grooming", label: "Cắt tỉa & Grooming", emoji: "✂️" },
  { id: "cham-soc-dac-biet", label: "Chăm sóc đặc biệt", emoji: "🩺" },
];

const DEMO_SERVICES: Service[] = [
  {
    id: "tam-ve-sinh-co-ban",
    category: "spa-tam",
    name: "Tắm vệ sinh cơ bản",
    description: "Tắm gội toàn thân với sữa tắm chuyên dụng, sấy khô, vệ sinh tai mắt mũi.",
    duration: 60,
    emoji: "🛁",
    features: ["Tắm gội với sữa tắm phù hợp", "Sấy khô lông", "Vệ sinh tai", "Vệ sinh mắt mũi", "Chải lông"],
    prices: { toy: 150_000, small: 200_000, medium: 250_000, large: 300_000 },
  },
  {
    id: "tam-spa-cao-cap",
    category: "spa-tam",
    name: "Tắm spa cao cấp",
    description: "Trải nghiệm spa thư giãn với sản phẩm cao cấp, massage và dưỡng lông.",
    duration: 90,
    emoji: "🧖",
    popular: true,
    features: [
      "Tắm với sữa tắm cao cấp",
      "Massage thư giãn 15 phút",
      "Dưỡng lông với dầu xả",
      "Sấy tạo kiểu",
      "Nước hoa thơm nhẹ",
      "Vệ sinh tai mắt mũi",
    ],
    prices: { toy: 250_000, small: 300_000, medium: 380_000, large: 450_000 },
  },
  {
    id: "cat-tia-long-co-ban",
    category: "cat-tia-grooming",
    name: "Cắt tỉa lông cơ bản",
    description: "Cắt tỉa gọn gàng, tạo form chuẩn theo từng giống.",
    duration: 90,
    emoji: "✂️",
    features: ["Tắm gội trước khi cắt", "Cắt tỉa theo form chuẩn", "Cắt móng", "Vệ sinh tai", "Sấy khô và chải lông"],
    prices: { toy: 200_000, small: 280_000, medium: 350_000, large: 400_000 },
  },
  {
    id: "cat-tia-tao-kieu-nghe-thuat",
    category: "cat-tia-grooming",
    name: "Cắt tỉa tạo kiểu nghệ thuật",
    description: "Cắt tỉa theo các kiểu dáng đặc biệt, nghệ thuật theo yêu cầu.",
    duration: 120,
    emoji: "💇",
    popular: true,
    features: ["Tư vấn kiểu dáng phù hợp", "Tắm gội cao cấp", "Cắt tỉa nghệ thuật", "Phụ kiện trang trí", "Chụp ảnh kỷ niệm"],
    prices: { toy: 350_000, small: 450_000, medium: 550_000, large: 600_000 },
  },
  {
    id: "ve-sinh-rang-mieng",
    category: "cham-soc-dac-biet",
    name: "Vệ sinh răng miệng",
    description: "Đánh răng, vệ sinh răng miệng chuyên sâu, phòng ngừa cao răng.",
    duration: 30,
    emoji: "🦷",
    features: ["Kiểm tra răng miệng", "Đánh răng chuyên sâu", "Loại bỏ cao răng nhẹ", "Tư vấn chăm sóc răng"],
    prices: { toy: 180_000, small: 180_000, medium: 180_000, large: 180_000 },
  },
  {
    id: "vat-tuyen-hoi",
    category: "cham-soc-dac-biet",
    name: "Vắt tuyến hôi",
    description: "Vắt tuyến hôi, vệ sinh vùng hậu môn sạch sẽ.",
    duration: 15,
    emoji: "🩺",
    features: ["Vắt tuyến hôi chuyên nghiệp", "Vệ sinh vùng hậu môn", "Kiểm tra sức khỏe"],
    prices: { toy: 100_000, small: 100_000, medium: 100_000, large: 100_000 },
  },
];

interface ApiService {
  slug: string;
  name: string;
  description: string;
  basePrice: number;
  duration: number;
  features: string[];
  isPopular: boolean;
  category: { slug: string; name: string };
  variants: { size: string; price: number }[];
}

function toService(s: ApiService): Service {
  const prices: Record<Size, number> = { toy: s.basePrice, small: s.basePrice, medium: s.basePrice, large: s.basePrice };
  for (const v of s.variants) {
    const k = v.size.toLowerCase() as Size;
    if (k === "toy" || k === "small" || k === "medium" || k === "large") prices[k] = v.price;
  }
  return {
    id: s.slug,
    category: s.category.slug,
    name: s.name,
    description: s.description,
    duration: s.duration,
    emoji: CATEGORY_EMOJI[s.category.slug] ?? "🐾",
    features: s.features ?? [],
    prices,
    popular: s.isPopular,
  };
}

const formatVnd = (n: number) => n.toLocaleString("vi-VN") + "đ";

const formatDuration = (m: number) =>
  m >= 60 ? `${Math.floor(m / 60)} giờ${m % 60 ? ` ${m % 60} phút` : ""}` : `${m} phút`;

export default function PricingPage() {
  const [active, setActive] = useState<string>("all");
  const [services, setServices] = useState<Service[]>(DEMO_SERVICES);
  const [categories, setCategories] = useState<Category[]>(DEMO_CATEGORIES);

  useEffect(() => {
    if (DEMO_MODE) return;
    let cancelled = false;
    (async () => {
      const [svc, cat] = await Promise.all([
        api.get<ApiService[]>("/api/services"),
        api.get<{ slug: string; name: string }[]>("/api/services/categories"),
      ]);
      if (cancelled) return;
      if (svc.data) setServices(svc.data.map(toService));
      if (cat.data?.length) {
        setCategories([
          { id: "all", label: "Tất cả", emoji: "🐾" },
          ...cat.data.map((c) => ({ id: c.slug, label: c.name, emoji: CATEGORY_EMOJI[c.slug] ?? "🐾" })),
        ]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filtered = active === "all" ? services : services.filter((s) => s.category === active);

  return (
    <div className="bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-accent-300/20 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold ring-1 ring-white/25">
            <Sparkles className="h-4 w-4" /> Giảm 10% cho lần đầu sử dụng dịch vụ
          </span>
          <h1 className="mt-6 text-4xl lg:text-5xl font-extrabold">Bảng giá dịch vụ</h1>
          <p className="mt-4 max-w-2xl mx-auto text-primary-50 text-lg">
            Giá minh bạch theo kích thước thú cưng — không phát sinh, không phụ phí ẩn.
          </p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* ── Phân loại size ── */}
        <section className="-mt-8 relative z-10">
          <div className="rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Info className="h-5 w-5 text-primary-600" />
              Phân loại kích thước thú cưng
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {SIZES.map((s) => (
                <div key={s.key} className="flex items-center gap-3 rounded-xl bg-gray-50 p-4">
                  <span className="text-3xl" aria-hidden>
                    {s.emoji}
                  </span>
                  <div>
                    <div className="font-bold text-gray-900">{s.label}</div>
                    <div className="text-sm text-gray-500">{s.weight}</div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* ── Tabs ── */}
        <div className="mt-12 flex flex-wrap justify-center gap-3">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActive(c.id)}
              className={`px-5 py-3 rounded-full font-semibold transition-all ${
                active === c.id
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-600/30 scale-105"
                  : "bg-white text-gray-700 hover:bg-primary-50 shadow"
              }`}
            >
              {c.emoji} {c.label}
            </button>
          ))}
        </div>

        {/* ── Thẻ dịch vụ ── */}
        <div className="mt-10 grid gap-8 md:grid-cols-2">
          {filtered.map((s) => {
            const fromPrice = Math.min(...Object.values(s.prices));
            return (
              <article
                key={s.id}
                className={`relative flex flex-col overflow-hidden rounded-3xl bg-white transition-all hover:-translate-y-1 hover:shadow-2xl ${
                  s.popular ? "ring-2 ring-primary-500 shadow-xl" : "ring-1 ring-gray-200 shadow-sm"
                }`}
              >
                {s.popular && (
                  <div className="absolute top-4 right-4 z-10 rounded-full bg-primary-600 px-3 py-1 text-xs font-bold text-white shadow">
                    ⭐ Phổ biến
                  </div>
                )}

                <div className="flex items-center gap-4 border-b border-gray-100 p-6">
                  <span className="flex h-16 w-16 shrink-0 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-50 to-primary-100 text-4xl">
                    {s.emoji}
                  </span>
                  <div className="flex-1">
                    <h3 className="text-xl font-bold text-gray-900">{s.name}</h3>
                    <span className="mt-1 inline-flex items-center gap-1 text-sm text-gray-500">
                      <Clock className="h-4 w-4" />
                      {formatDuration(s.duration)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="text-gray-600">{s.description}</p>

                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <div className="text-sm text-gray-500">Giá từ</div>
                      <div className="text-3xl font-extrabold text-primary-600">{formatVnd(fromPrice)}</div>
                    </div>
                    <div className="text-xs text-gray-400">theo kích thước thú cưng</div>
                  </div>

                  {/* Giá theo size */}
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {SIZES.map((sz) => (
                      <div key={sz.key} className="rounded-xl bg-primary-50 p-2 text-center">
                        <div className="text-[11px] text-gray-500">{sz.label}</div>
                        <div className="text-sm font-bold text-primary-700">{formatVnd(s.prices[sz.key])}</div>
                      </div>
                    ))}
                  </div>

                  {/* Bao gồm */}
                  <ul className="mt-5 grid gap-2 sm:grid-cols-2">
                    {s.features.map((f) => (
                      <li key={f} className="flex items-start gap-2 text-sm text-gray-700">
                        <Check className="mt-0.5 h-4 w-4 shrink-0 text-green-600" />
                        {f}
                      </li>
                    ))}
                  </ul>

                  <Link
                    href={`/booking?service=${s.id}`}
                    className="mt-6 inline-flex items-center justify-center gap-2 rounded-xl bg-primary-600 px-6 py-3 font-semibold text-white transition-colors hover:bg-primary-700"
                  >
                    Đặt lịch ngay
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* ── Combo & ưu đãi ── */}
        <section className="mt-16">
          <h2 className="text-center text-2xl font-extrabold text-gray-900">Ưu đãi dành cho khách quen</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {[
              { emoji: "🎁", title: "Lần đầu", desc: "Giảm 10% cho lần sử dụng dịch vụ đầu tiên." },
              { emoji: "💳", title: "Combo 5 lần", desc: "Mua trước 5 lần — giảm 15% tổng hóa đơn." },
              { emoji: "🏆", title: "Khách thân thiết", desc: "Từ lần thứ 5 trở đi, giảm thêm 10% mỗi lần." },
            ].map((p) => (
              <div
                key={p.title}
                className="rounded-2xl bg-white p-6 text-center ring-1 ring-gray-200 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="text-4xl" aria-hidden>
                  {p.emoji}
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{p.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Lưu ý ── */}
        <div className="mt-14 rounded-2xl border border-blue-100 bg-blue-50 p-6 sm:p-8">
          <h3 className="font-bold text-blue-900">Lưu ý</h3>
          <ul className="mt-3 space-y-2 text-sm text-blue-800">
            <li>• Giá trên chưa bao gồm VAT (nếu có).</li>
            <li>• Giá có thể thay đổi tùy theo tình trạng lông và da của thú cưng.</li>
            <li>• Thanh toán khi đến cửa hàng (COD) — chúng tôi liên hệ xác nhận trong 30 phút.</li>
          </ul>
        </div>

        {/* ── CTA ── */}
        <div className="mt-16 rounded-3xl bg-gray-900 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-extrabold sm:text-3xl">Cần tư vấn dịch vụ phù hợp?</h2>
          <p className="mt-3 text-gray-400">Đội ngũ PetShop sẵn sàng hỗ trợ bạn chọn gói chăm sóc tốt nhất cho bé cưng.</p>
          <div className="mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <a
              href="tel:0971616634"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-primary-700"
            >
              <Phone className="h-5 w-5" />
              0971 616 634
            </a>
            <a
              href="https://zalo.me/0971616634"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 font-semibold text-white transition-colors hover:bg-blue-700"
            >
              <MessageCircle className="h-5 w-5" />
              Chat Zalo
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}