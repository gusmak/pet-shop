"use client";

import { useCallback, useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { ChevronLeft, ChevronRight, Star } from "lucide-react";

interface Testimonial {
  name: string;
  pet: string;
  content: string;
  avatar: string;
}

const AVATARS = ["👩", "👨", "👩", "👩", "👨", "👩"];

const TRANSITION_MS = 600;

const visibleFor = (width: number) => (width >= 1024 ? 3 : width >= 640 ? 2 : 1);

export default function Testimonials() {
  const t = useTranslations("testimonials");

  const TESTIMONIALS: Testimonial[] = (
    t.raw("items") as { name: string; pet: string; content: string }[]
  ).map((it, i) => ({ ...it, avatar: AVATARS[i] }));

  const SLIDES = [...TESTIMONIALS, ...TESTIMONIALS];

  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(3);
  const [smooth, setSmooth] = useState(true);
  const [paused, setPaused] = useState(false);

  useEffect(() => {
    const onResize = () => setVisible(visibleFor(window.innerWidth));
    onResize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  // Tự động chuyển slide mỗi 4 giây.
  useEffect(() => {
    if (paused) return;
    const id = setInterval(() => {
      setSmooth(true);
      setIndex((i) => i + 1);
    }, 4000);
    return () => clearInterval(id);
  }, [paused]);

  // Khi trượt tới item clone (index === TOTAL_DOTS), đợi hết hiệu ứng rồi nhảy về 0.
  useEffect(() => {
    if (index >= TESTIMONIALS.length) {
      const timer = setTimeout(() => {
        setSmooth(false);
        setIndex(0);
      }, TRANSITION_MS);
      return () => clearTimeout(timer);
    }
    if (!smooth) {
      const raf = requestAnimationFrame(() => setSmooth(true));
      return () => cancelAnimationFrame(raf);
    }
  }, [index, smooth, TESTIMONIALS.length]);

  const step = 100 / visible;
  const activeDot = index % TESTIMONIALS.length;

  const go = useCallback(
    (dir: 1 | -1) => {
      setSmooth(true);
      setIndex((i) => {
        const next = i + dir;
        return next < 0 ? TESTIMONIALS.length - 1 : next; // prev từ đầu -> slide cuối
      });
    },
    [TESTIMONIALS.length],
  );

  const jumpTo = useCallback((i: number) => {
    setSmooth(true);
    setIndex(i);
  }, []);

  return (
    <section className="bg-gray-50 py-24">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10 flex items-end justify-between gap-6">
          <div className="max-w-2xl reveal">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">{t("eyebrow")}</p>
            <h2 className="mt-3 text-balance text-3xl lg:text-5xl font-extrabold text-gray-900">{t("title")}</h2>
          </div>
          <div className="hidden sm:flex gap-2">
            <button
              onClick={() => go(-1)}
              aria-label={t("ariaPrev")}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-700 shadow ring-1 ring-gray-200 transition-colors hover:bg-primary-600 hover:text-white"
            >
              <ChevronLeft className="h-5 w-5" />
            </button>
            <button
              onClick={() => go(1)}
              aria-label={t("ariaNext")}
              className="flex h-11 w-11 items-center justify-center rounded-full bg-white text-gray-700 shadow ring-1 ring-gray-200 transition-colors hover:bg-primary-600 hover:text-white"
            >
              <ChevronRight className="h-5 w-5" />
            </button>
          </div>
        </div>

        <div className="overflow-hidden" onMouseEnter={() => setPaused(true)} onMouseLeave={() => setPaused(false)}>
          <div
            className="flex"
            style={{
              transform: `translateX(-${index * step}%)`,
              transition: smooth ? `transform ${TRANSITION_MS}ms ease` : "none",
            }}
          >
            {SLIDES.map((item, i) => (
              <div key={`${item.name}-${i}`} className="shrink-0 px-2 sm:px-3" style={{ width: `${step}%` }}>
                <figure className="relative flex h-full flex-col rounded-3xl bg-white p-8 shadow-sm ring-1 ring-gray-200 transition-all hover:-translate-y-1 hover:shadow-xl">
                  <span className="absolute right-6 top-2 select-none font-heading text-7xl leading-none text-primary-100" aria-hidden>
                    &ldquo;
                  </span>
                  <div className="flex gap-0.5" aria-label={t("ariaRating")}>
                    {[0, 1, 2, 3, 4].map((n) => (
                      <Star key={n} className="h-5 w-5 fill-accent-400 text-accent-400" />
                    ))}
                  </div>
                  <blockquote className="relative mt-4 flex-1 leading-relaxed text-gray-700">{item.content}</blockquote>
                  <figcaption className="mt-6 flex items-center gap-3 border-t border-gray-100 pt-5">
                    <span className="flex h-12 w-12 items-center justify-center rounded-full bg-primary-100 text-2xl" aria-hidden>
                      {item.avatar}
                    </span>
                    <div>
                      <div className="font-bold text-gray-900">{item.name}</div>
                      <div className="text-sm text-gray-500">
                        {t("owner")} {item.pet}
                      </div>
                    </div>
                  </figcaption>
                </figure>
              </div>
            ))}
          </div>
        </div>

        <div className="mt-8 flex items-center justify-center gap-2">
          {TESTIMONIALS.map((_, i) => (
            <button
              key={i}
              onClick={() => jumpTo(i)}
              aria-label={`${t("ariaNext")} ${i + 1}`}
              className={`h-2.5 rounded-full transition-all ${
                activeDot === i ? "w-6 bg-primary-600" : "w-2.5 bg-gray-300 hover:bg-gray-400"
              }`}
            />
          ))}
        </div>
      </div>
    </section>
  );
}