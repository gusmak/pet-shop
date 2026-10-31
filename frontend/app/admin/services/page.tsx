'use client';

import { useCallback, useEffect, useState } from 'react';
import { useAuth } from '@/lib/useAuth';
import { api } from '@/lib/api';
import { DEMO_MODE, INITIAL_SERVICES, SERVICE_CATEGORIES, formatVnd, type DemoService } from '@/lib/demo';
import { usePersistedState } from '@/lib/usePersistedState';

const inputCls =
  'w-full px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-primary-500 focus:border-transparent disabled:bg-gray-50';

// ─────────────────────────────────────────────
// Chế độ demo: dữ liệu lưu localStorage
// ─────────────────────────────────────────────
function DemoServices() {
  const isAdmin = useAuth().can('services.manage');
  const [services, setServices] = usePersistedState<DemoService[]>('demo.services', INITIAL_SERVICES);
  const [search, setSearch] = useState('');
  const [category, setCategory] = useState('');
  const [status, setStatus] = useState('');
  const [editing, setEditing] = useState<DemoService | null>(null);
  const [form, setForm] = useState<Omit<DemoService, 'id'>>({
    name: '',
    category: SERVICE_CATEGORIES[0],
    price: 0,
    duration: '',
    isActive: true,
  });
  const [modalOpen, setModalOpen] = useState(false);
  const [readOnly, setReadOnly] = useState(false);

  const filtered = services.filter(
    (s) =>
      s.name.toLowerCase().includes(search.trim().toLowerCase()) &&
      (!category || s.category === category) &&
      (!status || (status === 'active') === s.isActive),
  );

  const openModal = (service: DemoService | null, view = false) => {
    setEditing(service);
    setForm(service ? { ...service } : { name: '', category: SERVICE_CATEGORIES[0], price: 0, duration: '', isActive: true });
    setReadOnly(view);
    setModalOpen(true);
  };

  const save = (e: React.FormEvent) => {
    e.preventDefault();
    if (editing) {
      setServices((prev) => prev.map((s) => (s.id === editing.id ? { ...form, id: s.id } : s)));
    } else {
      setServices((prev) => [...prev, { ...form, id: crypto.randomUUID() }]);
    }
    setModalOpen(false);
  };

  const remove = (s: DemoService) => {
    if (confirm(`Xóa dịch vụ "${s.name}"?`)) {
      setServices((prev) => prev.filter((x) => x.id !== s.id));
    }
  };

  const toggle = (s: DemoService) =>
    setServices((prev) => prev.map((x) => (x.id === s.id ? { ...x, isActive: !x.isActive } : x)));

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý dịch vụ</h1>
          <p className="text-gray-600">
            {isAdmin ? 'Quản lý danh sách dịch vụ spa và grooming' : 'Xem danh sách dịch vụ (chỉ đọc)'}
          </p>
        </div>
        {isAdmin && (
          <button
            onClick={() => openModal(null)}
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
          >
            <span>➕</span>
            Thêm dịch vụ
          </button>
        )}
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm dịch vụ..."
            className={`flex-1 min-w-[200px] ${inputCls}`}
          />
          <select value={category} onChange={(e) => setCategory(e.target.value)} className={inputCls + ' !w-auto'}>
            <option value="">Tất cả danh mục</option>
            {SERVICE_CATEGORIES.map((c) => (
              <option key={c}>{c}</option>
            ))}
          </select>
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls + ' !w-auto'}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Tên dịch vụ', 'Danh mục', 'Giá', 'Thời gian', 'Trạng thái'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-900">{h}</th>
                ))}
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((service) => (
                <tr key={service.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">{service.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{service.category}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold">{formatVnd(service.price)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600">{service.duration}</td>
                  <td className="px-6 py-4">
                    <button
                      disabled={!isAdmin}
                      onClick={() => toggle(service)}
                      title={isAdmin ? 'Bấm để đổi trạng thái' : undefined}
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold ${
                        service.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      } ${isAdmin ? 'cursor-pointer hover:opacity-80' : 'cursor-default'}`}
                    >
                      {service.isActive ? 'Hoạt động' : 'Ngừng'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right">
                    {isAdmin ? (
                      <div className="flex items-center justify-end gap-3">
                        <button onClick={() => openModal(service)} className="text-primary-600 hover:text-primary-700 font-medium text-sm">Sửa</button>
                        <button onClick={() => remove(service)} className="text-red-600 hover:text-red-700 font-medium text-sm">Xóa</button>
                      </div>
                    ) : (
                      <button onClick={() => openModal(service, true)} className="text-primary-600 hover:text-primary-700 font-medium text-sm">Xem</button>
                    )}
                  </td>
                </tr>
              ))}
              {filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Không tìm thấy dịch vụ phù hợp</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={() => setModalOpen(false)}>
          <form
            onSubmit={save}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-900">
              {readOnly ? 'Chi tiết dịch vụ' : editing ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}
            </h2>
            <fieldset disabled={readOnly} className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên dịch vụ *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Danh mục</label>
                  <select value={form.category} onChange={(e) => setForm({ ...form, category: e.target.value })} className={inputCls}>
                    {SERVICE_CATEGORIES.map((c) => (
                      <option key={c}>{c}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-gray-700 mb-1">Giá (VNĐ) *</label>
                  <input
                    type="number"
                    required
                    min={0}
                    step={1000}
                    value={form.price}
                    onChange={(e) => setForm({ ...form, price: Number(e.target.value) })}
                    className={inputCls}
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Thời gian *</label>
                <input
                  required
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: e.target.value })}
                  placeholder="VD: 45-60 phút"
                  className={inputCls}
                />
              </div>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input
                  type="checkbox"
                  checked={form.isActive}
                  onChange={(e) => setForm({ ...form, isActive: e.target.checked })}
                />
                Đang hoạt động
              </label>
            </fieldset>
            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                {readOnly ? 'Đóng' : 'Hủy'}
              </button>
              {!readOnly && (
                <button type="submit" className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold">
                  Lưu
                </button>
              )}
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

// ─────────────────────────────────────────────
// Chế độ thật: CRUD qua /api/admin/services
// ─────────────────────────────────────────────
type Size = 'toy' | 'small' | 'medium' | 'large';

const SIZE_KEYS: Size[] = ['toy', 'small', 'medium', 'large'];
const SIZE_LABELS: Record<Size, string> = {
  toy: 'Siêu nhỏ (<3kg)',
  small: 'Nhỏ (3–10kg)',
  medium: 'Vừa (10–25kg)',
  large: 'Lớn (>25kg)',
};

interface AdminService {
  id: string;
  name: string;
  slug: string;
  description: string;
  basePrice: number;
  duration: number;
  features: string[];
  isFeatured: boolean;
  isPopular: boolean;
  isActive: boolean;
  category: { id: string; name: string; slug: string };
  variants: { size: string; price: number }[];
}

interface AdminCategory {
  id: string;
  name: string;
  slug: string;
}

interface ServiceForm {
  name: string;
  categoryId: string;
  description: string;
  basePrice: number;
  duration: number;
  features: string;
  isActive: boolean;
  isFeatured: boolean;
  isPopular: boolean;
  prices: Record<Size, number>;
}

const EMPTY_FORM: ServiceForm = {
  name: '',
  categoryId: '',
  description: '',
  basePrice: 0,
  duration: 60,
  features: '',
  isActive: true,
  isFeatured: false,
  isPopular: false,
  prices: { toy: 0, small: 0, medium: 0, large: 0 },
};

const parseLines = (s: string) => s.split('\n').map((x) => x.trim()).filter(Boolean);

function toForm(s: AdminService): ServiceForm {
  const prices: Record<Size, number> = { toy: s.basePrice, small: s.basePrice, medium: s.basePrice, large: s.basePrice };
  for (const v of s.variants) {
    const k = v.size.toLowerCase() as Size;
    if (SIZE_KEYS.includes(k)) prices[k] = v.price;
  }
  return {
    name: s.name,
    categoryId: s.category.id,
    description: s.description,
    basePrice: s.basePrice,
    duration: s.duration,
    features: s.features.join('\n'),
    isActive: s.isActive,
    isFeatured: s.isFeatured,
    isPopular: s.isPopular,
    prices,
  };
}

const variantsOf = (prices: Record<Size, number>) =>
  SIZE_KEYS.map((s) => ({ size: s.toUpperCase(), price: prices[s] }));

function ApiServices() {
  const [services, setServices] = useState<AdminService[]>([]);
  const [categories, setCategories] = useState<AdminCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [search, setSearch] = useState('');
  const [status, setStatus] = useState('');

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<AdminService | null>(null);
  const [form, setForm] = useState<ServiceForm>(EMPTY_FORM);
  const [saving, setSaving] = useState(false);
  const [formError, setFormError] = useState('');

  const refresh = useCallback(async () => {
    const [svc, cat] = await Promise.all([
      api.get<AdminService[]>('/api/admin/services'),
      api.get<AdminCategory[]>('/api/services/categories'),
    ]);
    if (svc.data) setServices(svc.data);
    else setError(svc.error || 'Không tải được danh sách dịch vụ');
    if (cat.data) setCategories(cat.data);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      const [svc, cat] = await Promise.all([
        api.get<AdminService[]>('/api/admin/services'),
        api.get<AdminCategory[]>('/api/services/categories'),
      ]);
      if (cancelled) return;
      if (svc.data) setServices(svc.data);
      else setError(svc.error || 'Không tải được danh sách dịch vụ');
      if (cat.data) setCategories(cat.data);
      setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, []);

  const q = search.trim().toLowerCase();
  const filtered = services.filter(
    (s) =>
      (!q || s.name.toLowerCase().includes(q)) &&
      (!status || (status === 'active') === s.isActive),
  );

  const openCreate = () => {
    setEditing(null);
    setForm({ ...EMPTY_FORM, categoryId: categories[0]?.id ?? '' });
    setFormError('');
    setModalOpen(true);
  };

  const openEdit = (s: AdminService) => {
    setEditing(s);
    setForm(toForm(s));
    setFormError('');
    setModalOpen(true);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormError('');
    setSaving(true);

    const body = {
      name: form.name,
      category: form.categoryId,
      description: form.description,
      basePrice: form.basePrice,
      duration: form.duration,
      features: parseLines(form.features),
      isActive: form.isActive,
      isFeatured: form.isFeatured,
      isPopular: form.isPopular,
      variants: variantsOf(form.prices),
    };

    const res = editing
      ? await api.patch(`/api/admin/services/${editing.id}`, body)
      : await api.post('/api/admin/services', body);
    setSaving(false);

    if (!res.data) {
      setFormError(res.error || 'Không thể lưu dịch vụ');
      return;
    }
    setModalOpen(false);
    await refresh();
  };

  const toggle = async (s: AdminService) => {
    const res = await api.patch(`/api/admin/services/${s.id}`, { isActive: !s.isActive });
    if (!res.data) alert(res.error || 'Không thể thay đổi trạng thái');
    else await refresh();
  };

  const remove = async (s: AdminService) => {
    if (!confirm(`Xóa dịch vụ "${s.name}"?`)) return;
    const res = await api.delete(`/api/admin/services/${s.id}`);
    if (!res.data) alert(res.error || 'Không thể xóa dịch vụ');
    else await refresh();
  };

  return (
    <div>
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">Quản lý dịch vụ</h1>
          <p className="text-gray-600">Quản lý dịch vụ, giá theo kích thước và trạng thái hoạt động.</p>
        </div>
        <button
          onClick={openCreate}
          disabled={categories.length === 0}
          className="bg-primary-600 hover:bg-primary-700 disabled:opacity-50 text-white px-6 py-3 rounded-lg font-semibold transition-colors flex items-center gap-2"
        >
          <span>➕</span>
          Thêm dịch vụ
        </button>
      </div>

      {error && (
        <div role="alert" className="mb-6 bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}
        </div>
      )}

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 p-4 mb-6">
        <div className="flex flex-wrap gap-4">
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Tìm kiếm dịch vụ..."
            className={`flex-1 min-w-[200px] ${inputCls}`}
          />
          <select value={status} onChange={(e) => setStatus(e.target.value)} className={inputCls + ' !w-auto'}>
            <option value="">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động</option>
            <option value="inactive">Ngừng hoạt động</option>
          </select>
        </div>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="bg-gray-50 border-b border-gray-200">
              <tr>
                {['Tên dịch vụ', 'Danh mục', 'Giá gốc', 'Thời lượng', 'Trạng thái'].map((h) => (
                  <th key={h} className="px-6 py-4 text-left text-sm font-semibold text-gray-900 whitespace-nowrap">{h}</th>
                ))}
                <th className="px-6 py-4 text-right text-sm font-semibold text-gray-900">Thao tác</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-200">
              {filtered.map((s) => (
                <tr key={s.id} className="hover:bg-gray-50 transition-colors">
                  <td className="px-6 py-4 text-sm font-medium text-gray-900">
                    {s.name}
                    {s.isPopular && <span className="ml-2 text-xs bg-amber-100 text-amber-800 px-2 py-0.5 rounded-full">Phổ biến</span>}
                    <div className="text-xs text-gray-400 font-mono">{s.slug}</div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{s.category.name}</td>
                  <td className="px-6 py-4 text-sm text-gray-900 font-semibold whitespace-nowrap">{formatVnd(s.basePrice)}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 whitespace-nowrap">{s.duration} phút</td>
                  <td className="px-6 py-4">
                    <button
                      onClick={() => toggle(s)}
                      className={`inline-flex px-3 py-1 rounded-full text-xs font-semibold cursor-pointer hover:opacity-80 ${
                        s.isActive ? 'bg-green-100 text-green-800' : 'bg-gray-100 text-gray-800'
                      }`}
                    >
                      {s.isActive ? 'Hoạt động' : 'Ngừng'}
                    </button>
                  </td>
                  <td className="px-6 py-4 text-right whitespace-nowrap">
                    <div className="flex items-center justify-end gap-3">
                      <button onClick={() => openEdit(s)} className="text-primary-600 hover:text-primary-700 font-medium text-sm">Sửa</button>
                      <button onClick={() => remove(s)} className="text-red-600 hover:text-red-700 font-medium text-sm">Xóa</button>
                    </div>
                  </td>
                </tr>
              ))}
              {loading && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Đang tải...</td>
                </tr>
              )}
              {!loading && filtered.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center text-gray-500">Chưa có dịch vụ.</td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {modalOpen && (
        <div className="fixed inset-0 z-[60] flex items-center justify-center bg-black/40 p-4" onClick={() => setModalOpen(false)}>
          <form
            onSubmit={submit}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl shadow-xl w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 space-y-4"
          >
            <h2 className="text-xl font-bold text-gray-900">{editing ? 'Sửa dịch vụ' : 'Thêm dịch vụ'}</h2>

            <div className="grid sm:grid-cols-2 gap-4">
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tên dịch vụ *</label>
                <input required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className={inputCls} />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Danh mục *</label>
                <select required value={form.categoryId} onChange={(e) => setForm({ ...form, categoryId: e.target.value })} className={inputCls}>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Thời lượng (phút) *</label>
                <input
                  type="number"
                  required
                  min={5}
                  max={1440}
                  value={form.duration}
                  onChange={(e) => setForm({ ...form, duration: Number(e.target.value) })}
                  className={inputCls}
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Giá gốc (VNĐ) *</label>
                <input
                  type="number"
                  required
                  min={0}
                  step={1000}
                  value={form.basePrice}
                  onChange={(e) => {
                    const b = Number(e.target.value);
                    setForm({ ...form, basePrice: b, prices: { toy: b, small: b, medium: b, large: b } });
                  }}
                  className={inputCls}
                />
                <p className="text-xs text-gray-400 mt-1">Khi đổi giá gốc, giá 4 size được gán theo để tiện chỉnh lại.</p>
              </div>
              <div>
                <label className="block text-sm font-semibold text-gray-700 mb-1">Nổi bật</label>
                <label className="flex items-center gap-2 text-sm text-gray-700 h-[42px]">
                  <input type="checkbox" checked={form.isFeatured} onChange={(e) => setForm({ ...form, isFeatured: e.target.checked })} />
                  Hiển thị nổi bật trên trang chủ
                </label>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Giá theo kích thước (VNĐ)</label>
                <div className="grid grid-cols-2 gap-3">
                  {SIZE_KEYS.map((s) => (
                    <div key={s}>
                      <label className="block text-xs text-gray-500 mb-1">{SIZE_LABELS[s]}</label>
                      <input
                        type="number"
                        min={0}
                        step={1000}
                        value={form.prices[s]}
                        onChange={(e) => setForm({ ...form, prices: { ...form.prices, [s]: Number(e.target.value) } })}
                        className={inputCls}
                      />
                    </div>
                  ))}
                </div>
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Mô tả *</label>
                <textarea required rows={3} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} className={inputCls} />
              </div>
              <div className="sm:col-span-2">
                <label className="block text-sm font-semibold text-gray-700 mb-1">Tính năng / dịch vụ bao gồm (mỗi dòng một ý)</label>
                <textarea rows={4} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} className={inputCls} placeholder={'Tắm gội với sữa tắm phù hợp\nSấy khô lông\nVệ sinh tai'} />
              </div>
            </div>

            <div className="flex flex-wrap gap-5">
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} />
                Đang hoạt động
              </label>
              <label className="flex items-center gap-2 text-sm text-gray-700">
                <input type="checkbox" checked={form.isPopular} onChange={(e) => setForm({ ...form, isPopular: e.target.checked })} />
                Đánh dấu phổ biến
              </label>
            </div>

            {formError && <p className="text-sm text-red-600">{formError}</p>}

            <div className="flex justify-end gap-3 pt-2">
              <button type="button" onClick={() => setModalOpen(false)} className="px-5 py-2 rounded-lg border border-gray-300 text-gray-700 hover:bg-gray-50">
                Hủy
              </button>
              <button type="submit" disabled={saving} className="px-5 py-2 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-50">
                {saving ? 'Đang lưu...' : 'Lưu'}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
}

export default function AdminServicesPage() {
  return DEMO_MODE ? <DemoServices /> : <ApiServices />;
}