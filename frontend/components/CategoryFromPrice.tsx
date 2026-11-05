"use client";

import { useLocale } from "next-intl";
import { DEMO_MODE } from "@/lib/demo";
import { minPriceOf, useCatalog } from "@/lib/catalog";

// "Từ …đ" của một nhóm dịch vụ, lấy từ database (demo: dùng chuỗi mẫu truyền vào).
export default function CategoryFromPrice({ category, demoText }: { category: string; demoText: string }) {
  const locale = useLocale();
  const services = useCatalog();
  if (DEMO_MODE) return <>{demoText}</>;
  const inCategory = services?.filter((s) => s.category.slug === category) ?? [];
  if (inCategory.length === 0) return null;
  const min = Math.min(...inCategory.map(minPriceOf));
  return <>{min.toLocaleString(locale === "vi" ? "vi-VN" : "en-US")}đ</>;
}
