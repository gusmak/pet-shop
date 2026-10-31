import { getTranslations, setRequestLocale } from "next-intl/server";
import {
  Bath,
  Scissors,
  Heart,
  Star,
  Clock,
  MapPin,
  PhoneCall,
  MessageCircle,
  CalendarCheck,
  BadgeCheck,
  Sparkles,
  ArrowRight,
  ShieldCheck,
  HeartHandshake,
} from "lucide-react";
import { Link } from "@/i18n/navigation";
import GoogleMap from "@/components/GoogleMap";
import Testimonials from "@/components/Testimonials";

type Item = { title: string; description: string };
type ServiceItem = { title: string; description: string; price: string };
type LabelValue = { label: string; value: string };
type Stat = { value: string; label: string };

// Chỉ số trễ cho hiệu ứng hiện dần (xem .reveal trong globals.css)
const delay = (i: number) => ({ "--i": i } as React.CSSProperties);

const SERVICE_META = [
  { icon: Bath, emoji: "🛁", tint: "from-sky-100 to-primary-100" },
  { icon: Scissors, emoji: "✂️", tint: "from-primary-100 to-accent-100" },
  { icon: Heart, emoji: "🩺", tint: "from-rose-100 to-primary-100" },
];

const STEP_META = [
  { icon: CalendarCheck },
  { icon: BadgeCheck },
  { icon: Sparkles },
];

const FEATURE_META = [
  { icon: Star },
  { icon: HeartHandshake },
  { icon: ShieldCheck },
  { icon: Clock },
];

const QUICK_INFO_META = [
  { icon: Clock },
  { icon: PhoneCall },
  { icon: MapPin },
];

export default async function Home({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("home");

  const services = (t.raw("services.items") as ServiceItem[]).map((s, i) => ({
    ...s,
    ...SERVICE_META[i],
  }));
  const steps = (t.raw("steps.items") as Item[]).map((s, i) => ({
    ...s,
    ...STEP_META[i],
  }));
  const features = (t.raw("features.items") as Item[]).map((f, i) => ({
    ...f,
    ...FEATURE_META[i],
  }));
  const stats = t.raw("stats") as Stat[];
  const quickInfo = (t.raw("quickInfo") as LabelValue[]).map((q, i) => ({
    ...q,
    ...QUICK_INFO_META[i],
  }));

  return (
    <div className="overflow-x-clip">
      {/* ───────── Hero ───────── */}
      <section className="relative isolate bg-gradient-to-b from-primary-50 via-white to-white">
        <div className="pointer-events-none absolute -top-24 -right-24 -z-10 h-96 w-96 rounded-full bg-primary-200/50 blur-3xl animate-blob" />
        <div className="pointer-events-none absolute top-1/2 -left-32 -z-10 h-80 w-80 rounded-full bg-accent-200/40 blur-3xl animate-blob" style={{ animationDelay: "-6s" }} />

        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-14 pb-28 lg:pt-24 lg:pb-36">
          <div className="grid lg:grid-cols-2 gap-14 items-center">
            <div className="animate-fadeInUp">
              <span className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-primary-700 shadow-sm ring-1 ring-primary-200">
                <span aria-hidden>🐾</span> {t("hero.badge")}
              </span>
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-gray-900">
                {t("hero.titlePrefix")}{" "}
                <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">
                  {t("hero.titleHighlight")}
                </span>{" "}
                {t("hero.titleSuffix")}
              </h1>
              <p className="mt-6 max-w-xl text-lg text-gray-600 leading-relaxed">{t("hero.description")}</p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/booking"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-8 py-4 font-semibold text-white shadow-lg shadow-primary-600/30 transition-all hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/30"
                >
                  {t("hero.bookNow")}
                  <ArrowRight className="h-5 w-5 transition-transform group-hover:translate-x-1" />
                </Link>
                <a
                  href="tel:0971616634"
                  className="inline-flex items-center justify-center gap-2 rounded-full border-2 border-primary-600 bg-white px-8 py-4 font-semibold text-primary-700 transition-colors hover:bg-primary-50"
                >
                  <PhoneCall className="h-5 w-5" />
                  0971 616 634
                </a>
              </div>

              <dl className="mt-10 grid max-w-md grid-cols-3 gap-6 border-t border-primary-100 pt-8">
                {stats.map((s) => (
                  <div key={s.label}>
                    <dt className="text-2xl font-extrabold text-gray-900 font-heading">{s.value}</dt>
                    <dd className="text-sm text-gray-500">{s.label}</dd>
                  </div>
                ))}
              </dl>
            </div>

            <div className="relative mx-auto w-full max-w-md animate-fadeIn">
              <div className="relative flex aspect-square items-center justify-center rounded-[2.5rem] bg-gradient-to-br from-primary-200 via-primary-300 to-primary-500 shadow-2xl shadow-primary-500/30">
                <span className="select-none text-[9rem] sm:text-[11rem] leading-none animate-float drop-shadow-xl" aria-hidden>
                  🐕
                </span>
                <span className="absolute top-8 left-8 text-4xl animate-float" style={{ animationDelay: "-1s" }} aria-hidden>🐾</span>
                <span className="absolute bottom-10 right-10 text-3xl animate-float" style={{ animationDelay: "-2s" }} aria-hidden>🫧</span>
              </div>

              <div className="absolute -left-4 sm:-left-8 bottom-10 flex items-center gap-3 rounded-2xl bg-white p-4 shadow-xl ring-1 ring-black/5 animate-float" style={{ animationDelay: "-1.5s" }}>
                <span className="flex h-11 w-11 items-center justify-center rounded-full bg-secondary-100 text-secondary-700">
                  <Star className="h-5 w-5 fill-current" />
                </span>
                <div>
                  <div className="font-bold text-gray-900">{t("hero.floatingCustomer")}</div>
                  <div className="text-sm text-gray-500">{t("hero.floatingTrust")}</div>
                </div>
              </div>

              <div className="absolute -right-2 sm:-right-6 top-10 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-black/5 animate-float" style={{ animationDelay: "-3s" }}>
                <Bath className="h-5 w-5 text-primary-600" />
                <span className="text-sm font-semibold text-gray-800">{t("hero.floatingPrice")}</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Thông tin nhanh (đè lên hero) ───────── */}
      <section className="relative z-10 -mt-14 lg:-mt-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-px overflow-hidden rounded-3xl bg-gray-200 shadow-xl ring-1 ring-black/5 sm:grid-cols-3 reveal">
          {quickInfo.map((item) => (
            <div key={item.label} className="flex items-center gap-4 bg-white p-6">
              <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-primary-100 text-primary-600">
                <item.icon className="h-6 w-6" />
              </span>
              <div>
                <div className="text-sm text-gray-500">{item.label}</div>
                <div className="font-semibold text-gray-900">{item.value}</div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ───────── Dịch vụ ───────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center reveal">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">{t("services.eyebrow")}</p>
            <h2 className="mt-3 text-balance text-3xl lg:text-5xl font-extrabold text-gray-900">{t("services.title")}</h2>
            <p className="mt-4 text-lg text-gray-600">{t("services.description")}</p>
          </div>

          <div className="grid gap-6 md:grid-cols-3 lg:gap-8">
            {services.map((s, i) => (
              <article
                key={s.title}
                style={delay(i)}
                className="group reveal flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-gray-200 transition-all duration-300 hover:-translate-y-2 hover:shadow-2xl hover:ring-primary-300"
              >
                <div className={`relative flex h-44 items-center justify-center bg-gradient-to-br ${s.tint}`}>
                  <span className="text-7xl transition-transform duration-300 group-hover:scale-110 group-hover:-rotate-6" aria-hidden>
                    {s.emoji}
                  </span>
                </div>
                <div className="flex flex-1 flex-col p-7">
                  <span className="relative z-10 -mt-14 mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-primary-600 shadow-lg ring-1 ring-black/5 transition-colors group-hover:bg-primary-600 group-hover:text-white">
                    <s.icon className="h-7 w-7" />
                  </span>
                  <h3 className="text-xl font-bold text-gray-900">{s.title}</h3>
                  <p className="mt-2 flex-1 text-gray-600 leading-relaxed">{s.description}</p>
                  <div className="mt-6 flex items-center justify-between border-t border-gray-100 pt-5">
                    <span className="text-xl font-extrabold text-primary-600">
                      <span className="mr-1 text-sm font-medium text-gray-500">{t("services.from")}</span>
                      {s.price}
                    </span>
                    <Link href="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700">
                      {t("services.viewDetails")} <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
                    </Link>
                  </div>
                </div>
              </article>
            ))}
          </div>

          <div className="mt-12 text-center reveal">
            <Link
              href="/services"
              className="inline-flex items-center gap-2 rounded-full bg-gray-900 px-8 py-4 font-semibold text-white transition-colors hover:bg-gray-800"
            >
              {t("services.viewAll")} <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── Quy trình ───────── */}
      <section className="bg-primary-50/60 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center reveal">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">{t("steps.eyebrow")}</p>
            <h2 className="mt-3 text-balance text-3xl lg:text-5xl font-extrabold text-gray-900">{t("steps.title")}</h2>
          </div>

          <ol className="relative grid gap-10 md:grid-cols-3">
            <div className="absolute left-[16%] right-[16%] top-8 hidden h-0.5 bg-gradient-to-r from-primary-200 via-primary-400 to-primary-200 md:block" aria-hidden />
            {steps.map((step, i) => (
              <li key={step.title} style={delay(i)} className="reveal relative text-center">
                <span className="relative mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-primary-600 text-white shadow-lg shadow-primary-600/30 ring-8 ring-primary-50">
                  <step.icon className="h-7 w-7" />
                  <span className="absolute -right-1 -top-1 flex h-6 w-6 items-center justify-center rounded-full bg-white text-xs font-bold text-primary-700 shadow">
                    {i + 1}
                  </span>
                </span>
                <h3 className="mt-6 text-xl font-bold text-gray-900">{step.title}</h3>
                <p className="mx-auto mt-2 max-w-xs text-gray-600">{step.description}</p>
              </li>
            ))}
          </ol>
        </div>
      </section>

      {/* ───────── Vì sao chọn ───────── */}
      <section className="py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center reveal">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">{t("features.eyebrow")}</p>
            <h2 className="mt-3 text-balance text-3xl lg:text-5xl font-extrabold text-gray-900">{t("features.title")}</h2>
          </div>

          <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {features.map((f, i) => (
              <div
                key={f.title}
                style={delay(i)}
                className="reveal rounded-3xl bg-white p-7 ring-1 ring-gray-200 transition-all hover:-translate-y-1 hover:shadow-xl hover:ring-primary-200"
              >
                <span className="flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-primary-500 to-primary-700 text-white shadow-lg shadow-primary-600/25">
                  <f.icon className="h-7 w-7" />
                </span>
                <h3 className="mt-5 text-lg font-bold text-gray-900">{f.title}</h3>
                <p className="mt-2 text-gray-600 leading-relaxed">{f.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ───────── Đánh giá ───────── */}
      <Testimonials />

      {/* ───────── CTA ───────── */}
      <section className="px-4 py-24 sm:px-6 lg:px-8">
        <div className="reveal relative mx-auto max-w-5xl overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-primary-500 via-primary-600 to-primary-800 px-6 py-16 text-center shadow-2xl shadow-primary-600/30 sm:px-12">
          <div className="pointer-events-none absolute -left-16 -top-16 h-64 w-64 rounded-full bg-white/10 blur-2xl" />
          <div className="pointer-events-none absolute -bottom-20 -right-10 h-72 w-72 rounded-full bg-accent-300/20 blur-2xl" />
          <span className="relative text-5xl" aria-hidden>🐶🐱</span>
          <h2 className="relative mt-4 text-3xl lg:text-5xl font-extrabold text-white">{t("cta.title")}</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-primary-100">{t("cta.description")}</p>
          <div className="relative mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-primary-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary-50"
            >
              {t("cta.bookOnline")} <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="https://zalo.me/0971616634"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg ring-2 ring-white/30 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
            >
              <MessageCircle className="h-5 w-5" />
              {t("cta.chatZalo")}
            </a>
          </div>
        </div>
      </section>

      {/* ───────── Bản đồ ───────── */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center reveal">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">{t("map.eyebrow")}</p>
            <h2 className="mt-3 text-balance text-3xl lg:text-5xl font-extrabold text-gray-900">{t("map.title")}</h2>
          </div>
          <div className="reveal overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5">
            <GoogleMap latitude={21.005} longitude={105.825} address="7 Chùa Bộc, Đống Đa, Hà Nội" height="460px" />
          </div>
        </div>
      </section>
    </div>
  );
}