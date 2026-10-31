"use client";

import { Phone, MessageCircle } from "lucide-react";

const HOTLINE = "0971616634";
const ZALO_LINK = "https://zalo.me/0971616634";

// Lớp sóng nằm SAU nút (-z-10) và nút có nền đặc, để icon luôn rõ nét.
export default function ContactWidget() {
  return (
    <>
      {/* Nút nổi - Desktop */}
      <div className="hidden md:flex fixed bottom-6 right-6 z-50 flex-col items-center gap-4">
        <a
          href={ZALO_LINK}
          target="_blank"
          rel="noopener noreferrer"
          aria-label="Chat Zalo"
          className="group relative isolate flex items-center justify-center w-14 h-14 rounded-full bg-blue-600 text-white shadow-xl shadow-blue-600/30 ring-4 ring-white transition-transform hover:scale-110 hover:bg-blue-700"
        >
          <span className="absolute inset-0 -z-10 rounded-full bg-blue-500 animate-ring-out" aria-hidden />
          <MessageCircle className="w-7 h-7" strokeWidth={2.25} />
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            Chat Zalo
          </span>
        </a>

        <a
          href={`tel:${HOTLINE}`}
          aria-label="Gọi hotline"
          className="group relative isolate flex items-center justify-center w-14 h-14 rounded-full bg-primary-600 text-white shadow-xl shadow-primary-600/30 ring-4 ring-white transition-transform hover:scale-110 hover:bg-primary-700"
        >
          <span className="absolute inset-0 -z-10 rounded-full bg-primary-500 animate-ring-out" style={{ animationDelay: "0.6s" }} aria-hidden />
          <Phone className="w-6 h-6" strokeWidth={2.25} />
          <span className="pointer-events-none absolute right-full mr-3 whitespace-nowrap rounded-lg bg-gray-900 px-3 py-1.5 text-sm font-medium text-white opacity-0 shadow-lg transition-opacity group-hover:opacity-100">
            0971 616 634
          </span>
        </a>
      </div>

      {/* Thanh liên hệ cố định - Mobile */}
      <div className="md:hidden fixed bottom-0 inset-x-0 z-40 bg-white border-t border-gray-200 shadow-[0_-4px_20px_rgba(0,0,0,0.08)]">
        <div className="grid grid-cols-2 gap-3 p-2.5">
          <a
            href={`tel:${HOTLINE}`}
            className="flex items-center justify-center gap-2 h-12 rounded-xl bg-primary-600 text-white font-semibold active:bg-primary-700"
          >
            <Phone className="w-5 h-5" strokeWidth={2.25} />
            Gọi ngay
          </a>
          <a
            href={ZALO_LINK}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 h-12 rounded-xl bg-blue-600 text-white font-semibold active:bg-blue-700"
          >
            <MessageCircle className="w-5 h-5" strokeWidth={2.25} />
            Chat Zalo
          </a>
        </div>
      </div>

      {/* Chừa chỗ cho thanh mobile để không che nội dung cuối trang */}
      <div className="md:hidden h-[68px]" />
    </>
  );
}
