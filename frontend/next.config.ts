import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin("./i18n/request.ts");

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: false,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async redirects() {
    return [
      { source: "/dich-vu", destination: "/vi/services", permanent: true },
      { source: "/bang-gia", destination: "/vi/pricing", permanent: true },
      { source: "/dat-lich", destination: "/vi/booking", permanent: true },
      { source: "/lien-he", destination: "/vi/contact", permanent: true },
      { source: "/ve-chung-toi", destination: "/vi/about", permanent: true },
      { source: "/tin-tuc", destination: "/vi/news", permanent: true },
      { source: "/dang-nhap", destination: "/vi/login", permanent: true },
      { source: "/dang-ky", destination: "/vi/register", permanent: true },
      { source: "/tai-khoan", destination: "/vi/account", permanent: true },
    ];
  },
};

export default withNextIntl(nextConfig);