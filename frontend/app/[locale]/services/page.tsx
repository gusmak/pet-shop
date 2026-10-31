"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Clock, Check, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { DEMO_MODE } from "@/lib/demo";

type Size = "toy" | "small" | "medium" | "large";

interface UIService {
  id: string; // slug
  category: string; // slug danh mục
  name: string;
  description: string;
  minutes: number;
  features: string[];
  pricing: Record<Size, string>; // "150K"
  image: string; // emoji
  popular: boolean;
}

interface UICategory {
  id: string; // "all" hoặc slug danh mục
  name: string;
}

const CATEGORY_EMOJI: Record<string, string> = {
  "spa-tam": "🛁",
  "cat-tia-grooming": "✂️",
  "cham-soc-dac-biet": "🩺",
};

// Thông tin demo chỉ chứa dữ liệu không dịch: slug, giá, thời lượng, emoji.
const DEMO_META: {
  id: string;
  category: string;
  minutes: number;
  image: string;
  popular: boolean;
  pricing: Record<Size, string>;
}[] = [
  { id: "tam-ve-sinh-co-ban", category: "spa-tam", minutes: 60, image: "🛁", popular: false, pricing: { toy: "150K", small: "200K", medium: "250K", large: "300K" } },
  { id: "tam-spa-cao-cap", category: "spa-tam", minutes: 90, image: "🧖", popular: true, pricing: { toy: "250K", small: "300K", medium: "380K", large: "450K" } },
  { id: "cat-tia-long-co-ban", category: "cat-tia-grooming", minutes: 90, image: "✂️", popular: false, pricing: { toy: "200K", small: "280K", medium: "350K", large: "400K" } },
  { id: "cat-tia-tao-kieu-nghe-thuat", category: "cat-tia-grooming", minutes: 120, image: "💇", popular: true, pricing: { toy: "350K", small: "450K", medium: "550K", large: "600K" } },
  { id: "ve-sinh-rang-mieng", category: "cham-soc-dac-biet", minutes: 30, image: "🦷", popular: false, pricing: { toy: "180K", small: "180K", medium: "180K", large: "180K" } },
  { id: "vat-tuyen-hoi", category: "cham-soc-dac-biet", minutes: 15, image: "🩺", popular: false, pricing: { toy: "100K", small: "100K", medium: "100K", large: "100K" } },
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

const toPriceK = (n: number) => `${Math.round(n / 1000)}K`;

function toUIService(s: ApiService): UIService {
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
    features: s.features ?? [],
    pricing: {
      toy: toPriceK(prices.toy),
      small: toPriceK(prices.small),
      medium: toPriceK(prices.medium),
      large: toPriceK(prices.large),
    },
    image: CATEGORY_EMOJI[s.category.slug] ?? "🐾",
    popular: s.isPopular,
  };
}

export default function ServicesPage() {
  const t = useTranslations("servicesPage");
  const cat = useTranslations("catalog");
  const time = useTranslations("common.time");

  const allLabel = t("all");

  const buildDemo = (): { services: UIService[]; categories: UICategory[] } => {
    const categories: UICategory[] = [
      { id: "all", name: allLabel },
      { id: "spa-tam", name: cat("categories.spa-tam") },
      { id: "cat-tia-grooming", name: cat("categories.cat-tia-grooming") },
      { id: "cham-soc-dac-biet", name: cat("categories.cham-soc-dac-biet") },
    ];
    const services: UIService[] = DEMO_META.map((m) => {
      const name = cat(`services.${m.id}.name`);
      const description = cat(`services.${m.id}.description`);
      const features = cat.raw(`services.${m.id}.features`) as string[];
      return { ...m, name, description, features };
    });
    return { services, categories };
  };

  const [activeCategory, setActiveCategory] = useState("all");
  const [services, setServices] = useState<UIService[]>(buildDemo().services);
  const [categories, setCategories] = useState<UICategory[]>(buildDemo().categories);

  useEffect(() => {
    if (DEMO_MODE) return;
    let cancelled = false;
    (async () => {
      const [svc, catList] = await Promise.all([
        api.get<ApiService[]>("/api/services"),
        api.get<{ slug: string; name: string }[]>("/api/services/categories"),
      ]);
      if (cancelled) return;
      if (svc.data) setServices(svc.data.map(toUIService));
      if (catList.data?.length) {
        setCategories([{ id: "all", name: allLabel }, ...catList.data.map((c) => ({ id: c.slug, name: c.name }))]);
      }
    })();
    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const formatDuration = (m: number) =>
    m >= 60 ? `${Math.floor(m / 60)} ${time("hour")}${m % 60 ? ` ${m % 60} ${time("minute")}` : ""}` : `${m} ${time("minute")}`;

  const sizeLabels: Record<Size, string> = {
    toy: t("size.toy"),
    small: t("size.small"),
    medium: t("size.medium"),
    large: t("size.large"),
  };

  const filteredServices = activeCategory === "all" ? services : services.filter((s) => s.category === activeCategory);

  return (
    <div className="py-12 bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">{t("title")}</h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">{t("subtitle")}</p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setActiveCategory(c.id)}
              className={`px-5 py-3 rounded-full font-semibold transition-all min-h-[44px] ${
                activeCategory === c.id
                  ? "bg-primary-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:bg-primary-50 shadow"
              }`}
            >
              {c.name}
            </button>
          ))}
        </div>

        {/* Services Grid */}
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6 lg:gap-8">
          {filteredServices.map((service, index) => (
            <div
              key={service.id}
              className="bg-white rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 overflow-hidden group"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              {/* Image/Icon */}
              <div className="relative bg-gradient-to-br from-primary-100 to-primary-200 h-48 flex items-center justify-center text-8xl group-hover:scale-110 transition-transform duration-300">
                {service.image}
                {service.popular && (
                  <div className="absolute top-4 right-4 bg-primary-600 text-white px-4 py-1 rounded-full text-sm font-bold">
                    {t("popular")}
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">{service.name}</h3>
                <p className="text-gray-600 mb-4">{service.description}</p>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>{formatDuration(service.minutes)}</span>
                </div>

                {/* Features */}
                <ul className="space-y-2 mb-6">
                  {service.features.map((feature, idx) => (
                    <li key={idx} className="flex items-start gap-2">
                      <Check className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                      <span className="text-sm text-gray-700">{feature}</span>
                    </li>
                  ))}
                </ul>

                {/* Pricing Table */}
                <div className="bg-gray-50 rounded-lg p-4 mb-6">
                  <h4 className="font-bold text-gray-900 mb-3 text-sm">{t("priceBySize")}</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    {(Object.keys(sizeLabels) as Size[]).map((size) => (
                      <div key={size} className="flex justify-between">
                        <span className="text-gray-600">{sizeLabels[size]}:</span>
                        <span className="font-semibold text-primary-600">{service.pricing[size]}</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={`/booking?service=${service.id}`}
                  className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-all hover:scale-[1.02] text-center flex items-center justify-center gap-2"
                >
                  {t("bookNow")}
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-primary-600 rounded-2xl p-6 sm:p-8 lg:p-12 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">{t("ctaTitle")}</h2>
          <p className="text-xl text-primary-100 mb-8">{t("ctaDescription")}</p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white hover:bg-gray-100 text-primary-600 px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
            >
              {t("contactNow")}
            </Link>
            <a
              href="tel:0971616634"
              className="bg-primary-700 hover:bg-primary-800 text-white px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2"
            >
              {t("callNow")}
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}