"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Clock, Check, ArrowRight } from "lucide-react";
import { api } from "@/lib/api";
import { DEMO_MODE } from "@/lib/demo";

type Size = "toy" | "small" | "medium" | "large";

interface UIService {
  id: string; // slug
  category: string; // slug danh mục
  name: string;
  description: string;
  duration: string; // đã format
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

const DEMO_CATEGORIES: UICategory[] = [
  { id: "all", name: "Tất cả" },
  { id: "spa-tam", name: "Spa & Tắm" },
  { id: "cat-tia-grooming", name: "Cắt tỉa & Grooming" },
  { id: "cham-soc-dac-biet", name: "Chăm sóc đặc biệt" },
];

const DEMO_SERVICES: UIService[] = [
  {
    id: "tam-ve-sinh-co-ban",
    category: "spa-tam",
    name: "Tắm vệ sinh cơ bản",
    description: "Tắm gội toàn thân với sữa tắm chuyên dụng, sấy khô, vệ sinh tai mắt mũi",
    duration: "1 giờ",
    features: ["Tắm gội với sữa tắm phù hợp", "Sấy khô lông", "Vệ sinh tai", "Vệ sinh mắt mũi", "Chải lông"],
    pricing: { toy: "150K", small: "200K", medium: "250K", large: "300K" },
    image: "🛁",
    popular: false,
  },
  {
    id: "tam-spa-cao-cap",
    category: "spa-tam",
    name: "Tắm spa cao cấp",
    description: "Trải nghiệm spa thư giãn với sản phẩm cao cấp, massage và dưỡng lông",
    duration: "1 giờ 30 phút",
    features: [
      "Tắm với sữa tắm cao cấp",
      "Massage thư giãn 15 phút",
      "Dưỡng lông với dầu xả",
      "Sấy tạo kiểu",
      "Nước hoa thơm nhẹ",
      "Vệ sinh tai mắt mũi",
    ],
    pricing: { toy: "250K", small: "300K", medium: "380K", large: "450K" },
    image: "🧖",
    popular: true,
  },
  {
    id: "cat-tia-long-co-ban",
    category: "cat-tia-grooming",
    name: "Cắt tỉa lông cơ bản",
    description: "Cắt tỉa gọn gàng, tạo form chuẩn theo giống",
    duration: "1 giờ 30 phút",
    features: ["Tắm gội trước khi cắt", "Cắt tỉa theo form chuẩn", "Cắt móng", "Vệ sinh tai", "Sấy khô và chải lông"],
    pricing: { toy: "200K", small: "280K", medium: "350K", large: "400K" },
    image: "✂️",
    popular: false,
  },
  {
    id: "cat-tia-tao-kieu-nghe-thuat",
    category: "cat-tia-grooming",
    name: "Cắt tỉa tạo kiểu nghệ thuật",
    description: "Cắt tỉa theo các kiểu dáng đặc biệt, nghệ thuật theo yêu cầu",
    duration: "2 giờ",
    features: [
      "Tư vấn kiểu dáng phù hợp",
      "Tắm gội cao cấp",
      "Cắt tỉa nghệ thuật",
      "Nhuộm lông (nếu có)",
      "Phụ kiện trang trí",
      "Chụp ảnh kỷ niệm",
    ],
    pricing: { toy: "350K", small: "450K", medium: "550K", large: "600K" },
    image: "💇",
    popular: true,
  },
  {
    id: "ve-sinh-rang-mieng",
    category: "cham-soc-dac-biet",
    name: "Vệ sinh răng miệng",
    description: "Đánh răng, vệ sinh răng miệng chuyên sâu, phòng ngừa cao răng",
    duration: "30 phút",
    features: ["Kiểm tra răng miệng", "Đánh răng chuyên sâu", "Loại bỏ cao răng nhẹ", "Tư vấn chăm sóc răng"],
    pricing: { toy: "180K", small: "180K", medium: "180K", large: "180K" },
    image: "🦷",
    popular: false,
  },
  {
    id: "vat-tuyen-hoi",
    category: "cham-soc-dac-biet",
    name: "Vắt tuyến hôi",
    description: "Vắt tuyến hôi, vệ sinh vùng hậu môn sạch sẽ",
    duration: "15 phút",
    features: ["Vắt tuyến hôi chuyên nghiệp", "Vệ sinh vùng hậu môn", "Kiểm tra sức khỏe"],
    pricing: { toy: "100K", small: "100K", medium: "100K", large: "100K" },
    image: "🩺",
    popular: false,
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

const toPriceK = (n: number) => `${Math.round(n / 1000)}K`;

const formatDuration = (m: number) =>
  m >= 60 ? `${Math.floor(m / 60)} giờ${m % 60 ? ` ${m % 60} phút` : ""}` : `${m} phút`;

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
    duration: formatDuration(s.duration),
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
  const [activeCategory, setActiveCategory] = useState("all");
  const [services, setServices] = useState<UIService[]>(DEMO_SERVICES);
  const [categories, setCategories] = useState<UICategory[]>(DEMO_CATEGORIES);

  useEffect(() => {
    if (DEMO_MODE) return;
    let cancelled = false;
    (async () => {
      const [svc, cat] = await Promise.all([
        api.get<ApiService[]>("/api/services"),
        api.get<{ slug: string; name: string }[]>("/api/services/categories"),
      ]);
      if (cancelled) return;
      if (svc.data) setServices(svc.data.map(toUIService));
      if (cat.data?.length) {
        setCategories([{ id: "all", name: "Tất cả" }, ...cat.data.map((c) => ({ id: c.slug, name: c.name }))]);
      }
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const filteredServices =
    activeCategory === "all" ? services : services.filter((s) => s.category === activeCategory);

  return (
    <div className="py-12 bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="text-center mb-16 animate-fadeIn">
          <h1 className="text-4xl lg:text-5xl font-bold text-gray-900 mb-4">
            Dịch Vụ Của Chúng Tôi
          </h1>
          <p className="text-xl text-gray-600 max-w-2xl mx-auto">
            Đa dạng dịch vụ chăm sóc chuyên nghiệp, tận tâm cho thú cưng của bạn
          </p>
        </div>

        {/* Category Filter */}
        <div className="flex flex-wrap justify-center gap-3 mb-12">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setActiveCategory(cat.id)}
              className={`px-5 py-3 rounded-full font-semibold transition-all min-h-[44px] ${
                activeCategory === cat.id
                  ? "bg-primary-600 text-white shadow-lg scale-105"
                  : "bg-white text-gray-700 hover:bg-primary-50 shadow"
              }`}
            >
              {cat.name}
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
                    Phổ biến
                  </div>
                )}
              </div>

              {/* Content */}
              <div className="p-6">
                <h3 className="text-2xl font-bold text-gray-900 mb-2">
                  {service.name}
                </h3>
                <p className="text-gray-600 mb-4">
                  {service.description}
                </p>

                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                  <Clock className="w-4 h-4" />
                  <span>{service.duration}</span>
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
                  <h4 className="font-bold text-gray-900 mb-3 text-sm">Bảng giá theo size</h4>
                  <div className="grid grid-cols-2 gap-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Nhỏ:</span>
                      <span className="font-semibold text-primary-600">{service.pricing.toy}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Vừa:</span>
                      <span className="font-semibold text-primary-600">{service.pricing.small}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">TB:</span>
                      <span className="font-semibold text-primary-600">{service.pricing.medium}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Lớn:</span>
                      <span className="font-semibold text-primary-600">{service.pricing.large}</span>
                    </div>
                  </div>
                </div>

                {/* CTA */}
                <Link
                  href={`/booking?service=${service.id}`}
                  className="block w-full bg-primary-600 hover:bg-primary-700 text-white font-bold py-3 rounded-lg transition-all hover:scale-[1.02] text-center flex items-center justify-center gap-2"
                >
                  Đặt lịch ngay
                  <ArrowRight className="w-5 h-5" />
                </Link>
              </div>
            </div>
          ))}
        </div>

        {/* CTA Section */}
        <div className="mt-20 bg-primary-600 rounded-2xl p-6 sm:p-8 lg:p-12 text-center text-white">
          <h2 className="text-3xl lg:text-4xl font-bold mb-4">
            Không tìm thấy dịch vụ bạn cần?
          </h2>
          <p className="text-xl text-primary-100 mb-8">
            Liên hệ với chúng tôi để được tư vấn dịch vụ phù hợp nhất cho bé cưng
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/contact"
              className="bg-white hover:bg-gray-100 text-primary-600 px-8 py-4 rounded-full font-semibold transition-all hover:scale-105"
            >
              Liên hệ ngay
            </Link>
            <a
              href="tel:0971616634"
              className="bg-primary-700 hover:bg-primary-800 text-white px-8 py-4 rounded-full font-semibold transition-all flex items-center justify-center gap-2"
            >
              Gọi 0971 616 634
            </a>
          </div>
        </div>
      </div>
    </div>
  );
}