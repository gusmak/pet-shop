'use client';

import { useState } from 'react';
import { Clock, X } from 'lucide-react';

// Dữ liệu demo để test layout — chưa nối backend.
interface DemoArticle {
  id: string;
  category: string;
  title: string;
  description: string;
  content: string;
  readMinutes: number;
  emoji: string;
  tint: string; // gradient cho ảnh minh họa placeholder
}

const FEATURED: DemoArticle = {
  id: 'feat-1',
  category: 'Chăm sóc thú cưng',
  title: 'Vì sao răng miệng khỏe mạnh giúp thú cưng sống lâu hơn',
  description:
    'Bạn lo lắng về hơi thở của bé cưng? Chăm sóc răng miệng đúng cách không chỉ giảm mùi hôi mà còn ngăn ngừa bệnh tim, gan và thận cho chó mèo.',
  content:
    'Răng miệng không chỉ liên quan đến hơi thở. Cao răng tích tụ lâu ngày tạo điều kiện cho vi khuẩn theo đường máu tấn công tim, gan và thận của chó mèo.\n\nHãy đánh răng cho bé 2–3 lần mỗi tuần bằng kem chuyên dụng, kết hợp kiểm tra răng miệng định kỳ 6 tháng một lần.\n\nTại PetShop, dịch vụ vệ sinh răng miệng chuyên sâu giúp loại bỏ cao răng nhẹ và tư vấn cách chăm sóc phù hợp với từng giống.',
  readMinutes: 5,
  emoji: '🦷',
  tint: 'from-primary-100 via-primary-50 to-accent-100',
};

const LIFESTYLE: DemoArticle = {
  id: 'life-1',
  category: 'Phong cách sống',
  title: 'Cân bằng cuộc sống và thời gian cho thú cưng',
  description:
    'Những thói quen nhỏ giúp bạn dù bận rộn vẫn chăm sóc bé cưng chu đáo mỗi ngày mà không cảm thấy quá tải.',
  content:
    'Cuộc sống bận rộn không có nghĩa là phải giảm bớt sự quan tâm đến thú cưng. Chỉ cần 15 phút mỗi ngày cho việc chải lông, đi dạo hay chơi đùa, bé cưng đã cảm nhận được sự yêu thương.\n\nLên lịch chăm sóc cố định — tắm spa, cắt tỉa, vệ sinh — giúp bạn không bỏ quên và giữ bé luôn khỏe mạnh, sạch sẽ.',
  readMinutes: 6,
  emoji: '🏡',
  tint: 'from-secondary-100 to-primary-100',
};

const SIDEBAR: DemoArticle[] = [
  {
    id: 'side-1',
    category: 'Du lịch cùng pet',
    title: 'Giữ thú cưng an toàn khi đi du lịch xa',
    description: '',
    content:
      'Trước chuyến đi dài, hãy chuẩn bị nước, thức ăn quen thuộc và một chiếc lồng/túi vận chuyển vừa vặn. Dừng nghỉ mỗi 2–3 giờ để bé vận động và uống nước.\n\nĐừng quên mang theo giấy tờ tiêm phòng và thẻ tên ghi số điện thoại liên hệ.',
    readMinutes: 4,
    emoji: '🧳',
    tint: 'from-sky-100 to-primary-100',
  },
  {
    id: 'side-2',
    category: 'Chăm sóc thú cưng',
    title: '5 lỗi phổ biến khi tắm cho chó tại nhà',
    description: '',
    content:
      'Tắm quá thường xuyên, dùng sữa tắm người, để nước vào tai, không chải rối trước khi tắm và không sấy khô là những lỗi dễ gặp.\n\nHãy tắm 2–4 tuần một lần bằng sữa tắm chuyên dụng và luôn lau khô kỹ vùng tai.',
    readMinutes: 5,
    emoji: '🛁',
    tint: 'from-primary-100 to-accent-100',
  },
  {
    id: 'side-3',
    category: 'Dinh dưỡng',
    title: '5 loại thức ăn "tưởng lành" gây hại cho mèo',
    description: '',
    content:
      'Hành, tỏi, nho, sô-cô-la và sữa bò đều có thể gây hại cho mèo dù trông có vẻ vô tội.\n\nNếu nghi ngờ bé ăn phải, hãy liên hệ bác sĩ thú y ngay thay vì tự xử lý tại nhà.',
    readMinutes: 11,
    emoji: '🍎',
    tint: 'from-rose-100 to-accent-100',
  },
  {
    id: 'side-4',
    category: 'Chăm sóc thú cưng',
    title: 'Cách PetShop liên hệ với bạn — và cách chúng tôi không làm',
    description: '',
    content:
      'Chúng tôi chỉ gọi hoặc nhắn qua Zalo số 0971 616 634 để xác nhận lịch hẹn.\n\nPetShop không bao giờ yêu cầu bạn cung cấp mật khẩu, mã OTP hay chuyển khoản đặt cọc qua tin nhắn.',
    readMinutes: 10,
    emoji: '📞',
    tint: 'from-indigo-100 to-primary-100',
  },
  {
    id: 'side-5',
    category: 'Phong cách sống',
    title: 'Hiểu đúng về chi phí nuôi thú cưng',
    description: '',
    content:
      'Chi phí nuôi thú cưng gồm ba nhóm chính: thức ăn, y tế phòng bệnh và chăm sóc (tắm, cắt tỉa).\n\nLập ngân sách theo tháng giúp bạn chủ động hơn và không bị bất ngờ khi bé ốm đau.',
    readMinutes: 5,
    emoji: '💰',
    tint: 'from-emerald-100 to-secondary-100',
  },
  {
    id: 'side-6',
    category: 'Phong cách sống',
    title: 'Gỡ bỏ áp lực "phải mua đồ đắt" cho thú cưng',
    description: '',
    content:
      'Thú cưng không cần quá nhiều phụ kiện đắt tiền — thứ chúng cần nhất là thời gian và sự quan tâm của bạn.\n\nChọn những món thiết yếu, chất lượng tốt thay vì chạy theo mốt.',
    readMinutes: 4,
    emoji: '🛋️',
    tint: 'from-accent-100 to-primary-100',
  },
  {
    id: 'side-7',
    category: 'Phong cách sống',
    title: 'Khi nào nên đưa mèo đi spa?',
    description: '',
    content:
      'Mèo tự liếm lông nên ít khi cần tắm. Hãy đưa bé đi spa khi lông bết dính, có mùi, hoặc bác sĩ khuyên dùng dầu gội dược liệu.',
    readMinutes: 6,
    emoji: '🐱',
    tint: 'from-primary-100 to-secondary-100',
  },
];

// Badge thời gian đọc dùng chung.
const ReadBadge = ({ minutes }: { minutes: number }) => (
  <span className="inline-flex items-center gap-1.5 rounded-full bg-gray-100 px-3 py-1 text-xs font-medium text-gray-700">
    <Clock className="h-3.5 w-3.5" />
    {minutes} phút đọc
  </span>
);

const Category = ({ children }: { children: string }) => (
  <span className="text-xs font-semibold uppercase tracking-widest text-gray-500">{children}</span>
);

const Thumb = ({ article, className }: { article: DemoArticle; className?: string }) => (
  <div
    className={`flex items-center justify-center bg-gradient-to-br ${article.tint} ${className ?? ''}`}
    aria-hidden
  >
    <span className="select-none drop-shadow-sm">{article.emoji}</span>
  </div>
);

function ReadModal({ article, onClose }: { article: DemoArticle; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-[70] flex items-start justify-center bg-black/40 p-4 overflow-y-auto">
      <article className="relative my-8 w-full max-w-2xl rounded-3xl bg-white shadow-2xl">
        <button
          onClick={onClose}
          aria-label="Đóng"
          className="absolute right-4 top-4 z-10 rounded-full bg-white/80 p-2 text-gray-600 shadow hover:bg-white"
        >
          <X className="h-5 w-5" />
        </button>
        <div className="px-6 pt-14 pb-8 sm:px-10">
          <Category>{article.category}</Category>
          <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-gray-900">{article.title}</h2>
          <div className="mt-4">
            <ReadBadge minutes={article.readMinutes} />
          </div>
          <div className="mt-6 whitespace-pre-line leading-relaxed text-gray-700">{article.content}</div>
        </div>
      </article>
    </div>
  );
}

export default function NewsPage() {
  const [open, setOpen] = useState<DemoArticle | null>(null);

  if (open) return <ReadModal article={open} onClose={() => setOpen(null)} />;

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900">Tin tức & Kinh nghiệm</h1>
          <p className="mt-2 text-gray-600">Chia sẻ từ đội ngũ PetShop về chăm sóc thú cưng.</p>
        </div>

        <div className="grid lg:grid-cols-3 gap-10 lg:gap-14">
          {/* Cột trái: bài nổi bật + mục Phong cách sống */}
          <div className="lg:col-span-2 space-y-14">
            <article className="group cursor-pointer" onClick={() => setOpen(FEATURED)}>
              <div className="aspect-[16/9] overflow-hidden rounded-3xl">
                <Thumb
                  article={FEATURED}
                  className="h-full w-full text-7xl transition-transform duration-300 group-hover:scale-105"
                />
              </div>
              <div className="mt-6">
                <Category>{FEATURED.category}</Category>
                <h2 className="mt-3 text-2xl sm:text-3xl font-extrabold text-gray-900 transition-colors group-hover:text-primary-600">
                  {FEATURED.title}
                </h2>
                <p className="mt-3 leading-relaxed text-gray-600">{FEATURED.description}</p>
                <div className="mt-4">
                  <ReadBadge minutes={FEATURED.readMinutes} />
                </div>
              </div>
            </article>

            <section>
              <h2 className="text-2xl font-extrabold text-gray-900">Phong cách sống</h2>
              <p className="mt-2 text-gray-600">
                Những chủ đề giúp cuộc sống cùng thú cưng thêm trọn vẹn và nhẹ nhàng hơn.
              </p>

              <article
                className="group mt-6 flex flex-col gap-6 rounded-3xl bg-white ring-1 ring-gray-200 p-6 sm:flex-row sm:items-center sm:p-8 cursor-pointer transition-shadow hover:shadow-xl"
                onClick={() => setOpen(LIFESTYLE)}
              >
                <div className="w-full shrink-0 overflow-hidden rounded-2xl sm:w-64 aspect-[4/3]">
                  <Thumb
                    article={LIFESTYLE}
                    className="h-full w-full text-6xl transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1">
                  <Category>{LIFESTYLE.category}</Category>
                  <h3 className="mt-3 text-xl font-bold text-gray-900 transition-colors group-hover:text-primary-600">
                    {LIFESTYLE.title}
                  </h3>
                  <p className="mt-3 leading-relaxed text-gray-600">{LIFESTYLE.description}</p>
                  <div className="mt-4">
                    <ReadBadge minutes={LIFESTYLE.readMinutes} />
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
                    article={a}
                    className="h-full w-full text-4xl transition-transform duration-300 group-hover:scale-105"
                  />
                </div>
                <div className="flex-1">
                  <Category>{a.category}</Category>
                  <h3 className="mt-1 font-bold leading-snug text-gray-900 transition-colors group-hover:text-primary-600">
                    {a.title}
                  </h3>
                  <div className="mt-2">
                    <ReadBadge minutes={a.readMinutes} />
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