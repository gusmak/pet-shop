"use client";

import { Suspense } from "react";
import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactWidget from "@/components/ContactWidget";

// Khu vực /admin có layout riêng, không dùng Header/Footer của trang công khai.
function Chrome({ children }: { children: React.ReactNode }) {
  const isAdmin = usePathname().startsWith("/admin");

  if (isAdmin) return <>{children}</>;

  return (
    <>
      <Header />
      <main className="min-h-screen">{children}</main>
      <Footer />
      <ContactWidget />
    </>
  );
}

// usePathname() chỉ có ở runtime → chặn prerender các route động (vd /news/[slug]).
// Bọc Suspense để cho phép build cả route động rồi stream header/footer khi tới client.
export default function SiteChrome({ children }: { children: React.ReactNode }) {
  return (
    <Suspense fallback={null}>
      <Chrome>{children}</Chrome>
    </Suspense>
  );
}