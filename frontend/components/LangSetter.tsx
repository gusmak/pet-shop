"use client";

import { useEffect } from "react";

// Đồng bộ thuộc tính lang của <html> theo ngôn ngữ hiện tại khi chuyển trang.
export default function LangSetter({ locale }: { locale: string }) {
  useEffect(() => {
    document.documentElement.lang = locale;
  }, [locale]);

  return null;
}