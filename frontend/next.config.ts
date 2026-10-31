import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  cacheComponents: true,
  partialPrefetching: true,
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
      { source: "/dich-vu", destination: "/services", permanent: true },
      { source: "/bang-gia", destination: "/pricing", permanent: true },
      { source: "/dat-lich", destination: "/booking", permanent: true },
      { source: "/lien-he", destination: "/contact", permanent: true },
      { source: "/ve-chung-toi", destination: "/about", permanent: true },
      { source: "/tin-tuc", destination: "/news", permanent: true },
      { source: "/dang-nhap", destination: "/login", permanent: true },
      { source: "/dang-ky", destination: "/register", permanent: true },
      { source: "/tai-khoan", destination: "/account", permanent: true },
    ];
  },
};

export default nextConfig;