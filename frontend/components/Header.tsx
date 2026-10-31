"use client";

import Link from "next/link";
import { useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/lib/useAuth";
import { homeFor } from "@/lib/permissions";
import { Menu, X, Phone, MessageCircle, User } from "lucide-react";

// Trang chủ khớp đúng "/", các trang con khớp tiền tố (vd /services).
const isActiveLink = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

export default function Header() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout, can, permissions } = useAuth();

  const accountLink = user ? { href: homeFor(permissions), label: can("admin.access") ? "Quản trị" : "Tài khoản" } : { href: "/login", label: "Đăng nhập" };
  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    router.push("/");
  };

  const navigation = [
    { name: "Trang chủ", href: "/" },
    { name: "Dịch vụ", href: "/services" },
    { name: "Bảng giá", href: "/pricing" },
    { name: "Tin tức", href: "/news" },
    { name: "Về chúng tôi", href: "/about" },
    { name: "Liên hệ", href: "/contact" },
  ];

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      {/* Top Bar */}
      <div className="bg-primary-600 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-between text-sm">
          <div className="flex items-center gap-4">
            <a href="tel:0971616634" className="flex items-center gap-1 hover:text-primary-100">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">0971 616 634</span>
            </a>
            <a href="https://zalo.me/0971616634" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-100">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Zalo Chat</span>
            </a>
          </div>
          <div className="hidden md:block">
            <span>Giờ mở cửa: 8:00 - 20:00 (T2 - CN)</span>
          </div>
        </div>
      </div>

      {/* Main Header */}
      <nav className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-16">
          {/* Logo */}
          <Link href="/" className="flex items-center gap-2">
            <div className="w-10 h-10 bg-primary-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              P
            </div>
            <div>
              <div className="text-xl font-bold text-gray-900">PetShop</div>
              <div className="text-xs text-gray-500">Spa & Grooming</div>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <div className="hidden md:flex items-center gap-8">
            {navigation.map((item) => (
              <Link
                key={item.name}
                href={item.href}
                className={`font-medium transition-colors ${
                  isActiveLink(item.href, pathname)
                    ? "text-primary-600 font-semibold"
                    : "text-gray-700 hover:text-primary-600"
                }`}
              >
                {item.name}
              </Link>
            ))}
            {!loading && (
              <div className="flex items-center gap-3">
                <Link href={accountLink.href} className="flex items-center gap-1 text-gray-700 hover:text-primary-600 font-medium">
                  <User className="w-4 h-4" />
                  {user ? user.name : accountLink.label}
                </Link>
                {user && (
                  <button onClick={handleLogout} className="text-sm text-gray-500 hover:text-red-600">
                    Đăng xuất
                  </button>
                )}
              </div>
            )}
            <Link
              href="/booking"
              className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full font-semibold transition-colors"
            >
              Đặt lịch ngay
            </Link>
          </div>

          {/* Mobile menu button */}
          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            className="md:hidden p-2 rounded-lg hover:bg-gray-100"
            aria-label="Toggle menu"
          >
            {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>

        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className="md:hidden py-6 border-t bg-white">
            <div className="flex flex-col gap-3">
              {navigation.map((item) => (
                <Link
                  key={item.name}
                  href={item.href}
                  onClick={() => setIsMenuOpen(false)}
                  className={`px-5 py-4 rounded-xl font-medium transition-all text-base min-h-[48px] flex items-center ${
                    isActiveLink(item.href, pathname)
                      ? "text-primary-600 bg-primary-50 font-semibold"
                      : "text-gray-700 hover:text-primary-600 hover:bg-primary-50"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
              {!loading && (
                <>
                  <Link
                    href={accountLink.href}
                    onClick={() => setIsMenuOpen(false)}
                    className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-5 py-4 rounded-xl font-medium min-h-[48px] flex items-center"
                  >
                    {user ? `${accountLink.label} (${user.name})` : accountLink.label}
                  </Link>
                  {user && (
                    <button onClick={handleLogout} className="text-left text-gray-500 hover:text-red-600 px-5 py-3">
                      Đăng xuất
                    </button>
                  )}
                </>
              )}
              <Link
                href="/booking"
                onClick={() => setIsMenuOpen(false)}
                className="bg-primary-600 hover:bg-primary-700 text-white px-5 py-4 rounded-xl font-semibold text-center mt-3 transition-all min-h-[48px] flex items-center justify-center shadow-md"
              >
                Đặt lịch ngay
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}