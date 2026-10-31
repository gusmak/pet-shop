"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Clock, X } from "lucide-react";

// Dữ liệu demo để test layout — nội dung lấy từ messages (vi/en), emoji/tint giữ trong code.
interface DemoArticle {
  id: string;
  category: string;
  title: string;
  description: string;
  content: string;
  readMinutes: number;
  emoji: string;
  tint: string;
}

const SIDEBAR_META: { id: string; emoji: string; tint: string }[] = [
  { id: "side-1", emoji: "🧳", tint: "from-sky-100 to-primary-100" },
  { id: "side-2", emoji: "🛁", tint: "from-primary-100 to-accent-100" },
  { id: "side-3", emoji: "🍎", tint: "from-rose-100 to-accent-100" },
  { id: "side-4", emoji: "📞", tint: "from-indigo-100 to-primary-100" },
  { id: "side-5", emoji: "💰", tint: "from-emerald-100 to-secondary-100" },
  { id: "side-6", emoji: "🛋️", tint: "from-accent-100 to-primary-100" },
  { id: "side-7", emoji: "🐱", tint: "from-primary-100 to-secondary-100" },
];

const ReadBadge = ({ minutes, label }: { minutes: number; label: string }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
    <Clock className="h-3.5 w-3.5" />
    {minutes} {label}
  </span>
);

const Category = ({ children }: { children: string }) => (
  <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">{children}</span>
);

const Thumb = ({ emoji, tint, size }: { emoji: string; tint: string; size: string }) => (
  <div className={`flex items-center justify-center bg-gradient-to-br ${tint} ${size}`} aria-hidden>
    <span className="select-none drop-shadow-sm">{emoji}</span>
  </div>
);

function ReadModal({
  article,
  onClose,
  closeLabel,
  readLabel,
}: {
  article: DemoArticle;
  onClose: () => void;
  closeLabel: string;
  readLabel: string;
}) {
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
      <article className="relative my-8 w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          aria-label={closeLabel}
          className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-gray-600 shadow hover:bg-white"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="px-6 pt-14 pb-8 sm:px-10">
          <Category>{article.category}</Category>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-gray-900">{article.title}</h2>
          <div className="mt-4">
            <ReadBadge minutes={article.readMinutes} label={readLabel} />
          </div>
          <div className="mt-6 whitespace-pre-line leading-relaxed text-gray-700">{article.content}</div>
        </div>
      </article>
    </div>
  );
}

export default function NewsPage() {
  const t = useTranslations("newsPage");
  const n = useTranslations("news");

  const featuredRaw = n.raw("featured") as Omit<DemoArticle, "id" | "emoji" | "tint">;
  const FEATURED: DemoArticle = {
    ...featuredRaw,
    id: "feat-1",
    emoji: "🦷",
    tint: "from-primary-100 via-primary-50 to-accent-100",
  };

  const lifestyleRaw = n.raw("lifestyle") as Omit<DemoArticle, "id" | "emoji" | "tint">;
  const LIFESTYLE: DemoArticle = {
    ...lifestyleRaw,
    id: "life-1",
    emoji: "🏡",
    tint: "from-secondary-100 to-primary-100",
  };

  const SIDEBAR: DemoArticle[] = (n.raw("sidebar") as Omit<DemoArticle, "id" | "emoji" | "tint">[]).map((a, i) => ({
    ...a,
    ...SIDEBAR_META[i],
  }));

  const [open, setOpen] = useState<DemoArticle | null>(null);

  if (open) {
    return <ReadModal article={open} onClose={() => setOpen(null)} closeLabel={t("close")} readLabel={t("readMinutes")} />;
  }

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900">{t("title")}</h1>
          <p className="mt-2 text-gray-600">{t("subtitle")}</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">
          {/* Cột trái: bài nổi bật + mục Lifestyle */}
          <div className="lg:col-span-2 space-y-14">
            <article className="group cursor-pointer" onClick={() => setOpen(FEATURED)}>
              <div className="aspect-[16/9] overflow-hidden rounded-3xl">
                <Thumb
                  emoji={FEATURED.emoji}
                  tint={FEATURED.tint}
                  size="h-full w-full text-7xl transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="mt-6">
                <Category>{FEATURED.category}</Category>
                <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-gray-900 transition-colors group-hover:text-primary-600">
                  {FEATURED.title}
                </h2>
                <p className="mt-3 leading-relaxed text-gray-600">{FEATURED.description}</p>
                <div className="mt-4">
                  <ReadBadge minutes={FEATURED.readMinutes} label={t("readMinutes")} />
                </div>
              </div>
            </article>

            <section>
              <h2 className="text-2xl font-extrabold text-gray-900">{t("lifestyleTitle")}</h2>
              <p className="mt-2 text-gray-600">{t("lifestyleSubtitle")}</p>

              <article
                className="group mt-6 flex flex-col gap-6 rounded-3xl bg-white ring-1 ring-gray-200 p-6 sm:flex-row sm:items-center sm:p-8 cursor-pointer transition-shadow hover:shadow-xl"
                onClick={() => setOpen(LIFESTYLE)}
              >
                <div className="w-full shrink-0 overflow-hidden rounded-2xl sm:w-64 aspect-[4/3]">
                  <Thumb
                    emoji={LIFESTYLE.emoji}
                    tint={LIFESTYLE.tint}
                    size="h-full w-full text-6xl transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1">
                  <Category>{LIFESTYLE.category}</Category>
                  <h3 className="mt-3 text-xl font-bold text-gray-900 transition-colors group-hover:text-primary-600">
                    {LIFESTYLE.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-gray-600">{LIFESTYLE.description}</p>
                  <div className="mt-4">
                    <ReadBadge minutes={LIFESTYLE.readMinutes} label={t("readMinutes")} />
                  </div>
                </div>
              </article>
            </section>
          </div>

          {/* Cột phải: danh sách bài ngắn */}
          <aside className="space-y-6">
            {SIDEBAR.map((a) => (
              <article key={a.id} className="group flex cursor-pointer gap-4" onClick={() => setOpen(a)}>
                <div className="h-24 w-24 shrink-0 overflow-hidden rounded-xl">
                  <Thumb
                    emoji={a.emoji}
                    tint={a.tint}
                    size="h-full w-full text-4xl transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1">
                  <Category>{a.category}</Category>
                  <h3 className="mt-1 font-bold leading-snug text-gray-900 transition-colors group-hover:text-primary-600">
                    {a.title}
                  </h3>
                  <div className="mt-2">
                    <ReadBadge minutes={a.readMinutes} label={t("readMinutes")} />
                  </div>
                </div>
              </article>
            ))}
          </aside>
        </div>
      </div>
    </div>
  );
}