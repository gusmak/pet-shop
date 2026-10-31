"use client";

import { useLocale } from "next-intl";
import { usePathname, useRouter } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";

const LABELS: Record<string, string> = { vi: "VI", en: "EN" };

export default function LanguageSwitcher() {
  const locale = useLocale();
  const router = useRouter();
  const pathname = usePathname();

  return (
    <div className="flex items-center gap-1 rounded-full bg-gray-100 p-1" role="group" aria-label="Language">
      {routing.locales.map((l) => (
        <button
          key={l}
          type="button"
          onClick={() => router.replace(pathname, { locale: l })}
          aria-pressed={locale === l}
          className={`px-2.5 py-1 text-xs font-bold rounded-full transition-colors ${
            locale === l ? "bg-white text-primary-700 shadow" : "text-gray-600 hover:text-primary-600"
          }`}
        >
          {LABELS[l]}
        </button>
      ))}
    </div>
  );
}