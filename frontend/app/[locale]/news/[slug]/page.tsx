'use client';

import { useEffect, useState } from 'react';
import Image from 'next/image';
import { useParams } from 'next/navigation';
import { useTranslations } from 'next-intl';
import { Link } from '@/i18n/navigation';
import { api, assetUrl } from '@/lib/api';
import DOMPurify from 'dompurify';

// Giải quyết ảnh chèn trong nội dung: src `/uploads/x` (lưu trong DB) → URL đầy đủ tới backend.
DOMPurify.addHook('afterSanitizeAttributes', (node) => {
  if (node.tagName === 'IMG') {
    const src = node.getAttribute('src');
    if (src) node.setAttribute('src', assetUrl(src));
  }
});

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

export default function NewsDetailPage() {
  const t = useTranslations('newsPage');
  const { slug } = useParams<{ slug: string }>();
  const [post, setPost] = useState<Post | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    if (!slug) return;
    (async () => {
      const res = await api.get<Post>(`/api/posts/${slug}`);
      setLoading(false);
      if (res.error) setError(res.error);
      else setPost(res.data ?? null);
    })();
  }, [slug]);

  return (
    <div className="py-12">
      <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
        <Link href="/news" className="inline-flex items-center gap-2 text-sm font-semibold text-primary-600 hover:text-primary-700">
          ← {t('back')}
        </Link>

        {loading ? (
          <p className="mt-8 text-gray-500">Đang tải...</p>
        ) : error ? (
          <p className="mt-8 text-red-600">{error}</p>
        ) : !post ? (
          <p className="mt-8 text-gray-500">{t('empty')}</p>
        ) : (
          <article className="mt-8">
            {post.coverImage && (
              <div className="relative aspect-[16/9] w-full overflow-hidden rounded-3xl">
                <Image src={assetUrl(post.coverImage)} alt={post.title} fill unoptimized sizes="100vw" className="object-cover" />
              </div>
            )}
            <h1 className="mt-8 text-3xl lg:text-4xl font-extrabold text-gray-900">{post.title}</h1>
            <div className="mt-4 flex items-center gap-3 text-sm text-gray-500">
              <span>{post.authorName}</span>
              <span>·</span>
              <time>{post.createdAt}</time>
            </div>
            {/<[a-z][\s\S]*>/i.test(post.content) ? (
              <div
                className="rich-content mt-8"
                dangerouslySetInnerHTML={{ __html: DOMPurify.sanitize(post.content) }}
              />
            ) : (
              <div className="rich-content mt-8 whitespace-pre-wrap">{post.content}</div>
            )}
          </article>
        )}
      </div>
    </div>
  );
}