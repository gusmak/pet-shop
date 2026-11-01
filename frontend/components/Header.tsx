"use client";

import NextLink from "next/link";
import { useEffect, useRef, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, usePathname, useRouter } from "@/i18n/navigation";
import { useAuth } from "@/lib/useAuth";
import { Menu, X, Phone, MessageCircle, User, LogOut } from "lucide-react";
import LanguageSwitcher from "@/components/LanguageSwitcher";

// Trang chủ khớp đúng "/", các trang con khớp tiền tố (vd /services).
const isActiveLink = (href: string, pathname: string) =>
  href === "/" ? pathname === "/" : pathname.startsWith(href);

export default function Header() {
  const t = useTranslations("common");
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);
  const router = useRouter();
  const pathname = usePathname();
  const { user, loading, logout, can } = useAuth();

  const isAdmin = can("admin.access");
  const accountLink = !user
    ? { href: "/login", label: t("header.login"), admin: false }
    : { href: isAdmin ? "/admin" : "/account", label: isAdmin ? t("header.admin") : t("header.account"), admin: isAdmin };

  // Đóng dropdown khi click ra ngoài.
  useEffect(() => {
    const onClick = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener("mousedown", onClick);
    return () => document.removeEventListener("mousedown", onClick);
  }, []);

  const handleLogout = () => {
    logout();
    setIsMenuOpen(false);
    setUserMenuOpen(false);
    router.push("/");
  };

  const navigation = [
    { name: t("nav.home"), href: "/" },
    { name: t("nav.services"), href: "/services" },
    { name: t("nav.news"), href: "/news" },
    { name: t("nav.about"), href: "/about" },
    { name: t("nav.contact"), href: "/contact" },
  ];

  const userButtonCls =
    "flex h-10 w-10 items-center justify-center rounded-full text-gray-700 transition-colors hover:bg-gray-100 hover:text-primary-600";

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      {/* Top Bar */}
      <div className="bg-primary-600 text-white py-2 px-4">
        <div className="max-w-7xl mx-auto flex items-center justify-center sm:justify-between text-sm">
          <div className="hidden sm:flex items-center gap-4">
            <a href="tel:0971616634" className="flex items-center gap-1 hover:text-primary-100">
              <Phone className="w-4 h-4" />
              <span className="hidden sm:inline">0971 616 634</span>
            </a>
            <a href="https://zalo.me/0971616634" target="_blank" rel="noopener noreferrer" className="flex items-center gap-1 hover:text-primary-100">
              <MessageCircle className="w-4 h-4" />
              <span className="hidden sm:inline">Zalo Chat</span>
            </a>
          </div>
          <div>
            <span>{t("topbar.hours")}</span>
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
              <div className="text-xs text-gray-500">{t("tagline")}</div>
            </div>
          </Link>

          {/* Cụm bên phải: nav (desktop) + language + user + đặt lịch + menu icon (mobile/tablet) */}
          <div className="flex items-center gap-3 sm:gap-4">
            {/* Desktop navigation (chỉ hiện từ lg trở lên) */}
            <nav className="hidden lg:flex items-center gap-8">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href as any}
                  className={`font-medium transition-colors ${
                    isActiveLink(item.href, pathname)
                      ? "text-primary-600 font-semibold"
                      : "text-gray-700 hover:text-primary-600"
                  }`}
                >
                  {item.name}
                </Link>
              ))}
            </nav>

            {/* Language switcher (tablet trở lên) */}
            <div className="hidden md:block">
              <LanguageSwitcher />
            </div>

            {/* User (tablet trở lên) */}
            {!loading && (
              <div className="hidden md:block">
                {user ? (
                  <div className="relative" ref={userMenuRef}>
                    <button
                      onClick={() => setUserMenuOpen((v) => !v)}
                      aria-label={accountLink.label}
                      aria-expanded={userMenuOpen}
                      className={userButtonCls}
                    >
                      <User className="h-5 w-5" />
                    </button>

                    {userMenuOpen && (
                      <div className="absolute right-0 mt-2 w-52 overflow-hidden rounded-xl bg-white py-2 shadow-xl ring-1 ring-black/5">
                        <div className="px-4 py-2">
                          <div className="truncate text-sm font-semibold text-gray-900">{user.name}</div>
                          <div className="text-xs text-gray-500">{accountLink.label}</div>
                        </div>
                        {accountLink.admin ? (
                          <NextLink
                            href={accountLink.href}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 border-t border-gray-100 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <User className="h-4 w-4" />
                            {accountLink.label}
                          </NextLink>
                        ) : (
                          <Link
                            href={accountLink.href as any}
                            onClick={() => setUserMenuOpen(false)}
                            className="flex items-center gap-2 border-t border-gray-100 px-4 py-2.5 text-sm text-gray-700 transition-colors hover:bg-gray-50"
                          >
                            <User className="h-4 w-4" />
                            {accountLink.label}
                          </Link>
                        )}
                        <button
                          onClick={handleLogout}
                          className="flex w-full items-center gap-2 px-4 py-2.5 text-left text-sm text-red-600 transition-colors hover:bg-red-50"
                        >
                          <LogOut className="h-4 w-4" />
                          {t("header.logout")}
                        </button>
                      </div>
                    )}
                  </div>
                ) : (
                  <Link href="/login" aria-label={t("header.login")} className={userButtonCls}>
                    <User className="h-5 w-5" />
                  </Link>
                )}
              </div>
            )}

            {/* Đặt lịch ngay (sau danh sách menu, tablet trở lên) */}
            <Link
              href="/booking"
              className="hidden md:inline-flex items-center bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-full font-semibold transition-colors"
            >
              {t("header.bookNow")}
            </Link>

            {/* Menu icon (mobile + tablet, ngoài cùng bên phải) */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="lg:hidden p-2 rounded-lg hover:bg-gray-100"
              aria-label="Toggle menu"
            >
              {isMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>
        </div>

        {/* Mobile + Tablet Navigation */}
        {isMenuOpen && (
          <div className="lg:hidden py-6 border-t bg-white">
            <div className="flex flex-col gap-3">
              {navigation.map((item) => (
                <Link
                  key={item.href}
                  href={item.href as any}
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

              {/* Chỉ cần trên mobile (<md): từ tablet các mục này đã có trên thanh header */}
              {!loading && (
                <div className="md:hidden">
                  {accountLink.admin ? (
                    <NextLink
                      href={accountLink.href}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-5 py-4 rounded-xl font-medium min-h-[48px] flex items-center gap-2"
                    >
                      <User className="w-5 h-5" />
                      {accountLink.label}
                    </NextLink>
                  ) : (
                    <Link
                      href={accountLink.href as any}
                      onClick={() => setIsMenuOpen(false)}
                      className="text-gray-700 hover:text-primary-600 hover:bg-primary-50 px-5 py-4 rounded-xl font-medium min-h-[48px] flex items-center gap-2"
                    >
                      <User className="w-5 h-5" />
                      {accountLink.label}
                    </Link>
                  )}
                  {user && (
                    <button onClick={handleLogout} className="text-left text-gray-500 hover:text-red-600 px-5 py-3">
                      {t("header.logout")}
                    </button>
                  )}
                </div>
              )}

              <div className="md:hidden flex items-center justify-center px-5">
                <LanguageSwitcher />
              </div>
              <Link
                href="/booking"
                onClick={() => setIsMenuOpen(false)}
                className="md:hidden bg-primary-600 hover:bg-primary-700 text-white px-5 py-4 rounded-xl font-semibold text-center mt-3 transition-all min-h-[48px] flex items-center justify-center shadow-md"
              >
                {t("header.bookNow")}
              </Link>
            </div>
          </div>
        )}
      </nav>
    </header>
  );
}