"use client";

import { useEffect, useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Check, Clock, Info, Sparkles, ArrowRight, Phone, MessageCircle } from "lucide-react";
import { api } from "@/lib/api";
import { DEMO_MODE } from "@/lib/demo";

type Size = "toy" | "small" | "medium" | "large";

interface Service {
  id: string;
  category: string;
  name: string;
  description: string;
  minutes: number;
  emoji: string;
  features: string[];
  prices: Record<Size, number>;
  popular?: boolean;
}

interface Category {
  id: string;
  label: string;
  emoji: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  "spa-tam": "🛁",
  "cat-tia-grooming": "✂️",
  "cham-soc-dac-biet": "🩺",
};

const SIZE_EMOJI: Record<Size, string> = {
  toy: "🐹",
  small: "🐕",
  medium: "🐩",
  large: "🐕‍🦺",
};

const DEMO_META: {
  id: string;
  category: string;
  minutes: number;
  emoji: string;
  popular?: boolean;
  prices: Record<Size, number>;
}[] = [
  { id: "tam-ve-sinh-co-ban", category: "spa-tam", minutes: 60, emoji: "🛁", prices: { toy: 150_000, small: 200_000, medium: 250_000, large: 300_000 } },
  { id: "tam-spa-cao-cap", category: "spa-tam", minutes: 90, emoji: "🧖", popular: true, prices: { toy: 250_000, small: 300_000, medium: 380_000, large: 450_000 } },
  { id: "cat-tia-long-co-ban", category: "cat-tia-grooming", minutes: 90, emoji: "✂️", prices: { toy: 200_000, small: 280_000, medium: 350_000, large: 400_000 } },
  { id: "cat-tia-tao-kieu-nghe-thuat", category: "cat-tia-grooming", minutes: 120, emoji: "💇", popular: true, prices: { toy: 350_000, small: 450_000, medium: 550_000, large: 600_000 } },
  { id: "ve-sinh-rang-mieng", category: "cham-soc-dac-biet", minutes: 30, emoji: "🦷", prices: { toy: 180_000, small: 180_000, medium: 180_000, large: 180_000 } },
  { id: "vat-tuyen-hoi", category: "cham-soc-dac-biet", minutes: 15, emoji: "🩺", prices: { toy: 100_000, small: 100_000, medium: 100_000, large: 100_000 } },
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
    minutes: s.duration,
    emoji: CATEGORY_EMOJI[s.category.slug] ?? "🐾",
    features: s.features ?? [],
    prices,
    popular: s.isPopular,
  };
}

export default function PricingPage() {
  const locale = useLocale();
  const t = useTranslations("pricingPage");
  const cat = useTranslations("catalog");
  const time = useTranslations("common.time");

  const buildDemo = (): { services: Service[]; categories: Category[] } => {
    const categories: Category[] = [
      { id: "all", label: t("all"), emoji: "🐾" },
      { id: "spa-tam", label: cat("categories.spa-tam"), emoji: "🛁" },
      { id: "cat-tia-grooming", label: cat("categories.cat-tia-grooming"), emoji: "✂️" },
      { id: "cham-soc-dac-biet", label: cat("categories.cham-soc-dac-biet"), emoji: "🩺" },
    ];
    const services: Service[] = DEMO_META.map((m) => ({
      ...m,
      name: cat(`services.${m.id}.name`),
      description: cat(`services.${m.id}.description`),
      features: cat.raw(`services.${m.id}.features`) as string[],
    }));
    return { services, categories };
  };

  const [active, setActive] = useState<string>("all");
  const [services, setServices] = useState<Service[]>(buildDemo().services);
  const [categories, setCategories] = useState<Category[]>(buildDemo().categories);

  useEffect(() => {
    if (DEMO_MODE) return;
    let cancelled = false;
    (async () => {
      const [svc, catList] = await Promise.all([
        api.get<ApiService[]>("/api/services"),
        api.get<{ slug: string; name: string }[]>("/api/services/categories"),
      ]);
      if (cancelled) return;
      if (svc.data) setServices(svc.data.map(toService));
      if (catList.data?.length) {
        setCategories([
          { id: "all", label: t("all"), emoji: "🐾" },
          ...catList.data.map((c) => ({ id: c.slug, label: c.name, emoji: CATEGORY_EMOJI[c.slug] ?? "🐾" })),
        ]);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatVnd = (n: number) => n.toLocaleString(locale === "vi" ? "vi-VN" : "en-US") + "đ";
  const formatDuration = (m: number) =>
    m >= 60 ? `${Math.floor(m / 60)} ${time("hour")}${m % 60 ? ` ${m % 60} ${time("minute")}` : ""}` : `${m} ${time("minute")}`;

  const sizes = (t.raw("sizes") as { label: string; weight: string }[]).map((s, i) => {
    const keys: Size[] = ["toy", "small", "medium", "large"];
    return { key: keys[i], label: s.label, weight: s.weight, emoji: SIZE_EMOJI[keys[i]] };
  });

  const promos = t.raw("promos") as { title: string; desc: string }[];
  const notes = t.raw("notes") as string[];

  const filtered = active === "all" ? services : services.filter((s) => s.category === active);

  return (
    <div className="bg-gradient-to-br from-primary-50 via-white to-primary-50">
      {/* ── Hero ── */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-600 to-primary-800 text-white">
        <div className="pointer-events-none absolute -top-20 -right-20 h-72 w-72 rounded-full bg-white/10 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-24 -left-16 h-80 w-80 rounded-full bg-accent-300/20 blur-3xl" />
        <div className="relative max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-white/15 px-4 py-1.5 text-sm font-semibold ring-1 ring-white/25">
            <Sparkles className="h-4 w-4" /> {t("badge")}
          </span>
          <h1 className="mt-6 text-4xl lg:text-5xl font-extrabold">{t("title")}</h1>
          <p className="mt-4 max-w-2xl mx-auto text-primary-50 text-lg">{t("subtitle")}</p>
        </div>
      </section>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-20">
        {/* ── Phân loại size ── */}
        <section className="-mt-8 relative z-10">
          <div className="rounded-3xl bg-white shadow-xl ring-1 ring-black/5 p-6 sm:p-8">
            <h2 className="flex items-center gap-2 text-lg font-bold text-gray-900">
              <Info className="h-5 w-5 text-primary-600" />
              {t("sizeTitle")}
            </h2>
            <div className="mt-5 grid grid-cols-2 gap-4 lg:grid-cols-4">
              {sizes.map((s) => (
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
                    ⭐ {t("popular")}
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
                      {formatDuration(s.minutes)}
                    </span>
                  </div>
                </div>

                <div className="flex flex-1 flex-col p-6">
                  <p className="text-gray-600">{s.description}</p>

                  <div className="mt-5 flex items-end justify-between">
                    <div>
                      <div className="text-sm text-gray-500">{t("fromPrice")}</div>
                      <div className="text-3xl font-extrabold text-primary-600">{formatVnd(fromPrice)}</div>
                    </div>
                    <div className="text-xs text-gray-400">{t("perSize")}</div>
                  </div>

                  {/* Giá theo size */}
                  <div className="mt-4 grid grid-cols-4 gap-2">
                    {sizes.map((sz) => (
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
                    {t("bookNow")}
                    <ArrowRight className="h-4 w-4" />
                  </Link>
                </div>
              </article>
            );
          })}
        </div>

        {/* ── Combo & ưu đãi ── */}
        <section className="mt-16">
          <h2 className="text-center text-2xl font-extrabold text-gray-900">{t("promoTitle")}</h2>
          <div className="mt-8 grid gap-5 sm:grid-cols-3">
            {promos.map((p) => (
              <div
                key={p.title}
                className="rounded-2xl bg-white p-6 text-center ring-1 ring-gray-200 transition-all hover:-translate-y-1 hover:shadow-xl"
              >
                <div className="text-4xl" aria-hidden>
                  🎁
                </div>
                <h3 className="mt-4 text-lg font-bold text-gray-900">{p.title}</h3>
                <p className="mt-2 text-sm text-gray-600">{p.desc}</p>
              </div>
            ))}
          </div>
        </section>

        {/* ── Lưu ý ── */}
        <div className="mt-14 rounded-2xl border border-blue-100 bg-blue-50 p-6 sm:p-8">
          <h3 className="font-bold text-blue-900">{t("noteTitle")}</h3>
          <ul className="mt-3 space-y-2 text-sm text-blue-800">
            {notes.map((note) => (
              <li key={note}>• {note}</li>
            ))}
          </ul>
        </div>

        {/* ── CTA ── */}
        <div className="mt-16 rounded-3xl bg-gray-900 px-6 py-12 text-center text-white sm:px-12">
          <h2 className="text-2xl font-extrabold sm:text-3xl">{t("ctaTitle")}</h2>
          <p className="mt-3 text-gray-400">{t("ctaDescription")}</p>
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
              {t("chatZalo")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}