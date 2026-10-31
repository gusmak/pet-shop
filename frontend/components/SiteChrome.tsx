"use client";

import { usePathname } from "next/navigation";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactWidget from "@/components/ContactWidget";

// Khu vực /admin có layout riêng, không dùng Header/Footer của trang công khai.
export default function SiteChrome({ children }: { children: React.ReactNode }) {
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
