'use client';

import { useCallback, useEffect, useState } from 'react';
import type { ChangeEvent, FormEvent } from 'react';
import { useAuth } from '@/lib/useAuth';
import { api, assetUrl } from '@/lib/api';
import RichTextEditor from '@/components/RichTextEditor';

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

type Draft = {
  title: string;
  excerpt: string;
  content: string;
  coverImage: string;
  published: boolean;
};

const EMPTY: Draft = { title: '', excerpt: '', content: '', coverImage: '', published: true };

const inputCls =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent';

export default function AdminPostsPage() {
  const { user, can } = useAuth();
  const [posts, setPosts] = useState<Post[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [toggling, setToggling] = useState<string | null>(null);

  const [editing, setEditing] = useState<Post | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [open, setOpen] = useState(false);

  const canManageAll = can('posts.manage_all');
  const canManage = (p: Post) => canManageAll || p.authorId === user?.id;

  const load = useCallback(async () => {
    setLoading(true);
    const res = await api.get<Post[]>('/api/admin/posts');
    setLoading(false);
    if (res.error) setError(res.error);
    else setPosts(res.data ?? []);
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const openModal = (p: Post | null) => {
    setEditing(p);
    setDraft(
      p
        ? { title: p.title, excerpt: p.excerpt, content: p.content, coverImage: p.coverImage ?? '', published: p.published }
        : EMPTY,
    );
    setError('');
    setOpen(true);
  };

  const save = async (e: FormEvent) => {
    e.preventDefault();
    setSaving(true);
    const payload = { ...draft, coverImage: draft.coverImage.trim() || null };
    const res = editing
      ? await api.patch<Post>(`/api/admin/posts/${editing.id}`, payload)
      : await api.post<Post>('/api/admin/posts', payload);
    setSaving(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    setOpen(false);
    await load();
  };

  const remove = async (p: Post) => {
    if (!confirm(`Xóa bài "${p.title}"?`)) return;
    const res = await api.delete(`/api/admin/posts/${p.id}`);
    if (res.error) setError(res.error);
    else await load();
  };

  const handleCoverUpload = async (e: ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    e.target.value = '';
    if (!file) return;
    setUploading(true);
    setError('');
    const fd = new FormData();
    fd.append('file', file);
    const res = await api.upload<{ url: string }>('/api/admin/uploads', fd);
    setUploading(false);
    if (res.error) {
      setError(res.error);
      return;
    }
    if (res.data?.url) setDraft((d) => ({ ...d, coverImage: res.data!.url }));
  };

  const togglePublished = async (p: Post) => {
    setToggling(p.id);
    const res = await api.patch<Post>(`/api/admin/posts/${p.id}`, { published: !p.published });
    setToggling(null);
    if (res.error) {
      setError(res.error);
      return;
    }
    setPosts((prev) => prev.map((x) => (x.id === p.id ? { ...x, published: res.data?.published ?? !p.published } : x)));
  };

  const sorted = [...posts].sort((a, b) => b.createdAt.localeCompare(a.createdAt));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Bài viết</h1>
          <p className="text-gray-600">
            Bài đăng hiển thị tại trang <span className="font-mono">/news</span>
            {!canManageAll && ' — bạn chỉ có thể sửa/xóa bài của mình'}
          </p>
        </div>
        <button
          onClick={() => openModal(null)}
          className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold"
        >
          ➕ Viết bài mới
        </button>
      </div>

      {error && <p className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Tiêu đề', 'Tác giả', 'Ngày đăng', 'Trạng thái'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{h}</th>
                ))}
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {loading ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Đang tải...</td>
                </tr>
              ) : sorted.length === 0 ? (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Chưa có bài viết</td>
                </tr>
              ) : (
                sorted.map((p) => (
                  <tr key={p.id} className="hover:bg-gray-50">
                    <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.title}</td>
                    <td className="px-6 py-4 text-sm text-gray-600">{p.authorName}</td>
                    <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{p.createdAt}</td>
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-2.5">
                        <button
                          type="button"
                          role="switch"
                          aria-checked={p.published}
                          aria-label={p.published ? 'Đang hiển thị' : 'Đang ẩn'}
                          disabled={!canManage(p) || toggling === p.id}
                          onClick={() => togglePublished(p)}
                          title={p.published ? 'Chuyển thành nháp (ẩn)' : 'Đăng công khai (hiển thị)'}
                          className={`relative inline-flex h-6 w-11 shrink-0 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-primary-500 disabled:cursor-not-allowed disabled:opacity-60 ${p.published ? 'bg-green-500' : 'bg-gray-300'}`}
                        >
                          <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow transition-transform ${p.published ? 'translate-x-6' : 'translate-x-1'}`} />
                        </button>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-right whitespace-nowrap">
                      {canManage(p) && (
                        <div className="flex items-center justify-end gap-3">
                          <button onClick={() => openModal(p)} className="text-primary-600 hover:text-primary-700 font-medium text-sm">
                            Sửa
                          </button>
                          <button onClick={() => remove(p)} className="text-red-600 hover:text-red-700 font-medium text-sm">
                            Xóa
                          </button>
                        </div>
                      )}
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {open && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={() => setOpen(false)}>
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-3xl max-h-[90vh] overflow-y-auto p-6 space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-900">{editing ? 'Sửa bài viết' : 'Viết bài mới'}</h2>

            {error && <p className="rounded-lg bg-red-50 px-4 py-2 text-sm text-red-700">{error}</p>}

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề *</label>
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={inputCls} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả ngắn *</label>
              <input required value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} className={inputCls} />
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Ảnh bìa</label>
              {draft.coverImage ? (
                <div className="relative overflow-hidden rounded-lg border border-gray-200">
                  <img src={assetUrl(draft.coverImage)} alt="Ảnh bìa" className="h-40 w-full object-cover" />
                  <button
                    type="button"
                    onClick={() => setDraft({ ...draft, coverImage: '' })}
                    className="absolute right-2 top-2 rounded-md bg-black/60 px-2 py-1 text-xs text-white hover:bg-black/80"
                  >
                    Xóa
                  </button>
                </div>
              ) : (
                <label className="flex h-40 cursor-pointer flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-gray-300 text-gray-500 hover:border-primary-400 hover:text-primary-600">
                  <span className="text-sm font-medium">{uploading ? 'Đang tải lên...' : 'Chọn ảnh bìa'}</span>
                  <span className="text-xs">JPG / PNG / WebP — tối đa 5MB</span>
                  <input
                    type="file"
                    accept="image/jpeg,image/png,image/webp,image/gif,image/avif"
                    className="hidden"
                    disabled={uploading}
                    onChange={handleCoverUpload}
                  />
                </label>
              )}
            </div>

            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nội dung *</label>
              <RichTextEditor
                value={draft.content}
                onChange={(html) => setDraft({ ...draft, content: html })}
                onError={(msg) => setError(msg)}
              />
            </div>

            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
              Đăng công khai (bỏ chọn để lưu nháp)
            </label>

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                Hủy
              </button>
              <button
                type="submit"
                disabled={saving}
                className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-60"
              >
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}