import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["vietnamese", "latin"],
  variable: "--font-inter",
  display: "swap",
});

const montserrat = Montserrat({
  subsets: ["vietnamese", "latin"],
  variable: "--font-montserrat",
  display: "swap",
});

// Metadata mặc định — áp dụng cho khu /admin; trang công khai sẽ ghi đè theo locale.
export const metadata: Metadata = {
  title: "PetShop - Spa & Grooming Thú Cưng Chuyên Nghiệp",
  description: "Dịch vụ spa, grooming, cắt tỉa lông chuyên nghiệp cho thú cưng.",
  keywords: ["pet shop", "spa thú cưng", "grooming chó mèo", "cắt tỉa lông", "tắm spa"],
};

// Root layout dùng chung cho cả khu công khai (có locale) và khu quản trị (/admin).
// <html> lang mặc định là "vi", sẽ được cập nhật sang "en" bởi LangSetter ở public layout.
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="font-sans antialiased">{children}</body>
    </html>
  );
}