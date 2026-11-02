'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { api, assetUrl } from '@/lib/api';

type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  coverImage: string | null;
  authorId: string;
  authorName: string;
  createdAt: string;
  published: boolean;
};

const FALLBACKS = [
  { emoji: '🐾', tint: 'from-primary-100 to-accent-100' },
  { emoji: '🛁', tint: 'from-sky-100 to-primary-100' },
  { emoji: '🐱', tint: 'from-primary-100 to-secondary-100' },
  { emoji: '🍎', tint: 'from-rose-100 to-accent-100' },
  { emoji: '🏡', tint: 'from-secondary-100 to-primary-100' },
  { emoji: '🧴', tint: 'from-indigo-100 to-primary-100' },
];

export default function NewsPage() {
  const t = useTranslations('newsPage');
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    (async () => {
      const res = await api.get<Post[]>('/api/posts');
      setLoading(false);
      if (res.error) setError(res.error);
      else setPosts(res.data ?? []);
    })();
  }, []);

  return (
    <div className="py-12">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="mb-10">
          <h1 className="text-3xl lg:text-4xl font-extrabold text-gray-900">{t('title')}</h1>
          <p className="mt-2 text-gray-600">{t('subtitle')}</p>
        </div>

        {loading ? (
          <p className="text-gray-500">Đang tải...</p>
        ) : error ? (
          <p className="text-red-600">{error}</p>
        ) : posts.length === 0 ? (
          <p className="text-gray-500">{t('empty')}</p>
        ) : (
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
            {posts.map((p, i) => {
              const f = FALLBACKS[i % FALLBACKS.length];
              return (
                <Link
                  key={p.id}
                  href={`/news/${p.slug}`}
                  className="group flex flex-col overflow-hidden rounded-3xl bg-white ring-1 ring-gray-200 transition-shadow hover:shadow-xl"
                >
                  <div className="relative aspect-[16/9] w-full overflow-hidden bg-gray-100">
                    {p.coverImage ? (
                      <Image
                        src={assetUrl(p.coverImage)}
                        alt={p.title}
                        fill
                        unoptimized
                        sizes="(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 33vw"
                        className="object-cover transition-transform duration-300 group-hover:scale-105"
                      />
                    ) : (
                      <div className={`flex h-full w-full items-center justify-center bg-gradient-to-br ${f.tint}`}>
                        <span className="text-5xl select-none">{f.emoji}</span>
                      </div>
                    )}
                  </div>
                  <div className="flex flex-1 flex-col p-6">
                    <h2 className="text-lg font-bold text-gray-900 transition-colors group-hover:text-primary-600">
                      {p.title}
                    </h2>
                    <p className="mt-2 line-clamp-3 flex-1 text-sm leading-relaxed text-gray-600">{p.excerpt}</p>
                    <div className="mt-4 flex items-center justify-between text-xs text-gray-500">
                      <span>{p.authorName}</span>
                      <time>{p.createdAt}</time>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}