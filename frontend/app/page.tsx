import Link from "next/link";
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
import GoogleMap from "@/components/GoogleMap";
import Testimonials from "@/components/Testimonials";

const services = [
  {
    icon: Bath,
    emoji: "🛁",
    title: "Tắm & Spa",
    description: "Tắm gội, massage thư giãn với sản phẩm cao cấp, an toàn cho da và lông của bé.",
    price: "150K",
    tint: "from-sky-100 to-primary-100",
  },
  {
    icon: Scissors,
    emoji: "✂️",
    title: "Cắt tỉa & Grooming",
    description: "Cắt tỉa, tạo kiểu chuyên nghiệp theo giống và theo mong muốn của bạn.",
    price: "200K",
    tint: "from-primary-100 to-accent-100",
  },
  {
    icon: Heart,
    emoji: "🩺",
    title: "Chăm sóc đặc biệt",
    description: "Vệ sinh răng miệng, vắt tuyến hôi và chăm sóc chuyên sâu cho bé.",
    price: "100K",
    tint: "from-rose-100 to-primary-100",
  },
];

const steps = [
  { icon: CalendarCheck, title: "Đặt lịch online", description: "Chọn dịch vụ, ngày và giờ phù hợp chỉ trong chưa đầy một phút." },
  { icon: BadgeCheck, title: "Nhận xác nhận", description: "Chúng tôi gọi hoặc nhắn tin xác nhận lịch hẹn trong vòng 30 phút." },
  { icon: Sparkles, title: "Bé được chăm sóc", description: "Đưa bé đến cửa hàng, nhận lại một bé cưng sạch thơm và thật vui." },
];

const features = [
  { icon: Star, title: "Đội ngũ chuyên nghiệp", description: "Groomer giàu kinh nghiệm, được đào tạo bài bản." },
  { icon: HeartHandshake, title: "Tận tâm như gia đình", description: "Nhẹ nhàng, kiên nhẫn với từng bé, kể cả bé nhút nhát." },
  { icon: ShieldCheck, title: "Sản phẩm an toàn", description: "Sữa tắm và dụng cụ phù hợp từng loại da, từng giống." },
  { icon: Clock, title: "Linh hoạt thời gian", description: "Mở cửa 8:00 – 20:00 cả tuần, đặt lịch trực tuyến mọi lúc." },
];

// Chỉ số trễ cho hiệu ứng hiện dần (xem .reveal trong globals.css)
const delay = (i: number) => ({ "--i": i } as React.CSSProperties);

export default function Home() {
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
                <span aria-hidden>🐾</span> Spa & Grooming chuyên nghiệp
              </span>
              <h1 className="mt-6 text-4xl sm:text-5xl lg:text-6xl font-extrabold leading-[1.1] text-gray-900">
                Chăm sóc <span className="bg-gradient-to-r from-primary-500 to-primary-700 bg-clip-text text-transparent">thú cưng</span> như người trong gia đình
              </h1>
              <p className="mt-6 max-w-xl text-lg text-gray-600 leading-relaxed">
                Tắm spa, cắt tỉa, chăm sóc chuyên sâu bởi đội ngũ giàu kinh nghiệm. Đặt lịch online chỉ vài bước, bé cưng của bạn
                sẽ được yêu thương đúng cách.
              </p>

              <div className="mt-8 flex flex-col sm:flex-row gap-4">
                <Link
                  href="/booking"
                  className="group inline-flex items-center justify-center gap-2 rounded-full bg-primary-600 px-8 py-4 font-semibold text-white shadow-lg shadow-primary-600/30 transition-all hover:-translate-y-0.5 hover:bg-primary-700 hover:shadow-xl hover:shadow-primary-600/30"
                >
                  Đặt lịch ngay
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
                {[
                  ["500+", "khách hàng"],
                  ["6", "dịch vụ"],
                  ["8–20h", "mỗi ngày"],
                ].map(([value, label]) => (
                  <div key={label}>
                    <dt className="text-2xl font-extrabold text-gray-900 font-heading">{value}</dt>
                    <dd className="text-sm text-gray-500">{label}</dd>
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
                  <div className="font-bold text-gray-900">500+ khách hàng</div>
                  <div className="text-sm text-gray-500">tin tưởng sử dụng</div>
                </div>
              </div>

              <div className="absolute -right-2 sm:-right-6 top-10 flex items-center gap-2 rounded-2xl bg-white px-4 py-3 shadow-xl ring-1 ring-black/5 animate-float" style={{ animationDelay: "-3s" }}>
                <Bath className="h-5 w-5 text-primary-600" />
                <span className="text-sm font-semibold text-gray-800">Tắm spa từ 150K</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ───────── Thông tin nhanh (đè lên hero) ───────── */}
      <section className="relative z-10 -mt-14 lg:-mt-20 px-4 sm:px-6 lg:px-8">
        <div className="mx-auto grid max-w-5xl gap-px overflow-hidden rounded-3xl bg-gray-200 shadow-xl ring-1 ring-black/5 sm:grid-cols-3 reveal">
          {[
            { icon: Clock, label: "Giờ mở cửa", value: "8:00 – 20:00, Thứ 2 – CN" },
            { icon: PhoneCall, label: "Hotline", value: "0971 616 634" },
            { icon: MapPin, label: "Địa chỉ", value: "7 Chùa Bộc, Đống Đa, Hà Nội" },
          ].map((item) => (
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
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">Dịch vụ</p>
            <h2 className="mt-3 text-balance text-3xl lg:text-5xl font-extrabold text-gray-900">Mọi thứ bé cần để xinh và khỏe</h2>
            <p className="mt-4 text-lg text-gray-600">Đa dạng dịch vụ chăm sóc chuyên nghiệp cho thú cưng của bạn.</p>
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
                      <span className="mr-1 text-sm font-medium text-gray-500">Từ</span>
                      {s.price}
                    </span>
                    <Link href="/services" className="inline-flex items-center gap-1 text-sm font-semibold text-primary-600 hover:text-primary-700">
                      Xem chi tiết <ArrowRight className="h-4 w-4 transition-transform group-hover:translate-x-1" />
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
              Xem tất cả dịch vụ <ArrowRight className="h-5 w-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* ───────── Quy trình ───────── */}
      <section className="bg-primary-50/60 py-24">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-14 max-w-2xl text-center reveal">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">Quy trình</p>
            <h2 className="mt-3 text-balance text-3xl lg:text-5xl font-extrabold text-gray-900">Đặt lịch chỉ trong 3 bước</h2>
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
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">Vì sao chọn PetShop</p>
            <h2 className="mt-3 text-balance text-3xl lg:text-5xl font-extrabold text-gray-900">Cam kết cho từng bé cưng</h2>
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
          <h2 className="relative mt-4 text-3xl lg:text-5xl font-extrabold text-white">Sẵn sàng chăm sóc bé cưng?</h2>
          <p className="relative mx-auto mt-4 max-w-xl text-lg text-primary-100">
            Đặt lịch ngay hôm nay để nhận ưu đãi 10% cho lần đầu sử dụng dịch vụ.
          </p>
          <div className="relative mt-8 flex flex-col justify-center gap-4 sm:flex-row">
            <Link
              href="/booking"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-white px-8 py-4 font-semibold text-primary-700 shadow-lg transition-all hover:-translate-y-0.5 hover:bg-primary-50"
            >
              Đặt lịch online <ArrowRight className="h-5 w-5" />
            </Link>
            <a
              href="https://zalo.me/0971616634"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center gap-2 rounded-full bg-blue-600 px-8 py-4 font-semibold text-white shadow-lg ring-2 ring-white/30 transition-all hover:-translate-y-0.5 hover:bg-blue-700"
            >
              <MessageCircle className="h-5 w-5" />
              Chat Zalo
            </a>
          </div>
        </div>
      </section>

      {/* ───────── Bản đồ ───────── */}
      <section className="pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="mx-auto mb-10 max-w-2xl text-center reveal">
            <p className="text-sm font-semibold uppercase tracking-widest text-primary-600">Địa chỉ</p>
            <h2 className="mt-3 text-balance text-3xl lg:text-5xl font-extrabold text-gray-900">Ghé thăm cửa hàng</h2>
          </div>
          <div className="reveal overflow-hidden rounded-3xl shadow-xl ring-1 ring-black/5">
            <GoogleMap latitude={21.005} longitude={105.825} address="7 Chùa Bộc, Đống Đa, Hà Nội" height="460px" />
          </div>
        </div>
      </section>
    </div>
  );
}
