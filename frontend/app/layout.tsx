import type { Metadata } from "next";
import { Inter, Montserrat } from "next/font/google";
import "./globals.css";
import SiteChrome from "@/components/SiteChrome";

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

export const metadata: Metadata = {
  title: "PetShop - Spa & Grooming Thú Cưng Chuyên Nghiệp",
  description: "Dịch vụ spa, grooming, cắt tỉa lông chuyên nghiệp cho thú cưng. Đặt lịch online dễ dàng, chăm sóc tận tâm.",
  keywords: ["pet shop", "spa thú cưng", "grooming chó mèo", "cắt tỉa lông", "tắm spa"],
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="vi" className={`${inter.variable} ${montserrat.variable}`}>
      <body className="font-sans antialiased">
        <SiteChrome>{children}</SiteChrome>
      </body>
    </html>
  );
}
