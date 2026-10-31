'use client';

import { useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { usePersistedState } from '@/lib/usePersistedState';
import { INITIAL_POSTS, type DemoPost } from '@/lib/demo';

type Draft = Pick<DemoPost, 'title' | 'excerpt' | 'content' | 'published'>;
const EMPTY: Draft = { title: '', excerpt: '', content: '', published: true };

const inputCls =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent';

export default function AdminPostsPage() {
  const { user, can } = useAuth();
  const [posts, setPosts] = usePersistedState<DemoPost[]>('demo.posts', INITIAL_POSTS);
  const [editing, setEditing] = useState<DemoPost | null>(null);
  const [draft, setDraft] = useState<Draft>(EMPTY);
  const [open, setOpen] = useState(false);

  // Có posts.manage_all thì sửa/xóa mọi bài; không thì chỉ bài của chính mình.
  const canManageAll = can('posts.manage_all');
  const canManage = (p: DemoPost) => canManageAll || p.authorId === user?.id;

  const openModal = (p: DemoPost | null) => {
    setEditing(p);
    setDraft(p ? { title: p.title, excerpt: p.excerpt, content: p.content, published: p.published } : EMPTY);
    setOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;
    if (editing) {
      setPosts((prev) => prev.map((p) => (p.id === editing.id ? { ...p, ...draft } : p)));
    } else {
      const today = new Date().toISOString().slice(0, 10);
      setPosts((prev) => [
        { ...draft, id: crypto.randomUUID(), authorId: user.id, authorName: user.name, createdAt: today },
        ...prev,
      ]);
    }
    setOpen(false);
  };

  const remove = (p: DemoPost) => {
    if (confirm(`Xóa bài "${p.title}"?`)) setPosts((prev) => prev.filter((x) => x.id !== p.id));
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
              {sorted.map((p) => (
                <tr key={p.id} className="hover:bg-gray-50">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{p.title}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{p.authorName}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{p.createdAt}</td>
                  <td className="px-6 py-4">
                    <span className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${p.published ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'}`}>
                      {p.published ? 'Đã đăng' : 'Bản nháp'}
                    </span>
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
              ))}
              {sorted.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-6 py-12 text-center text-gray-500">Chưa có bài viết</td>
                </tr>
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
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-900">{editing ? 'Sửa bài viết' : 'Viết bài mới'}</h2>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Tiêu đề *</label>
              <input required value={draft.title} onChange={(e) => setDraft({ ...draft, title: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả ngắn *</label>
              <input required value={draft.excerpt} onChange={(e) => setDraft({ ...draft, excerpt: e.target.value })} className={inputCls} />
            </div>
            <div>
              <label className="block text-sm font-semibold text-gray-700 mb-1">Nội dung *</label>
              <textarea required rows={8} value={draft.content} onChange={(e) => setDraft({ ...draft, content: e.target.value })} className={inputCls} />
            </div>
            <label className="flex items-center gap-2 text-sm text-gray-700">
              <input type="checkbox" checked={draft.published} onChange={(e) => setDraft({ ...draft, published: e.target.checked })} />
              Đăng công khai (bỏ chọn để lưu nháp)
            </label>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setOpen(false)} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                Hủy
              </button>
              <button type="submit" className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold">
                Lưu
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}
