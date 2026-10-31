import { defineRouting } from "next-intl/routing";

export const routing = defineRouting({
  // 2 ngôn ngữ chính: Tiếng Việt (mặc định) và Tiếng Anh.
  locales: ["vi", "en"] as const,
  defaultLocale: "vi",
  // Luôn hiện tiền tố locale trong URL (vd /vi/services, /en/services).
  localePrefix: "always",
  localeDetection: true,
});