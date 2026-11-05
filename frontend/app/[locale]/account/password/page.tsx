"use client";

import { useEffect, useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { api } from "@/lib/api";
import { DEMO_MODE } from "@/lib/demo";
import { useAuth, clearSession } from "@/lib/useAuth";

export default function ChangePasswordPage() {
  const t = useTranslations("accountPage");
  const router = useRouter();
  const { user, loading } = useAuth();
  const [form, setForm] = useState({ current: "", next: "", confirm: "" });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (!loading && !user) router.replace("/login");
  }, [loading, user, router]);

  if (loading || !user) return <div className="py-32 text-center text-gray-500">{t("loading")}</div>;

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (form.next !== form.confirm) return setError(t("passwordMismatch"));
    if (form.next === form.current) return setError(t("samePassword"));
    setSaving(true);
    const res = await api.post("/api/auth/change-password", { currentPassword: form.current, newPassword: form.next });
    setSaving(false);
    if (!res.data) return setError(res.error || t("passwordFailed"));
    // Backend đã vô hiệu mọi token cũ — xóa phiên và buộc đăng nhập lại bằng mật khẩu mới.
    clearSession();
    router.replace("/login?pw=changed");
  };

  const cls = "w-full px-4 py-3 border border-gray-300 rounded-lg focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

  return (
    <div className="py-12 bg-gradient-to-br from-primary-50 via-white to-primary-50">
      <div className="max-w-md mx-auto px-4 sm:px-6">
        <Link href="/account" className="text-sm text-primary-600 hover:text-primary-700">
          {t("backToAccount")}
        </Link>

        <form onSubmit={submit} className="mt-4 bg-white rounded-2xl shadow-lg p-6 space-y-4">
          <h1 className="text-2xl font-bold text-gray-900">{t("changePassword")}</h1>
          <p className="text-sm text-gray-600">{t("passwordPageIntro")}</p>

          {DEMO_MODE ? (
            <p className="text-sm text-amber-700">Chế độ demo — không đổi được mật khẩu.</p>
          ) : (
            <>
              <input required type="password" autoComplete="current-password" placeholder={t("currentPassword")} value={form.current} onChange={(e) => setForm({ ...form, current: e.target.value })} className={cls} />
              <input required type="password" autoComplete="new-password" minLength={6} placeholder={t("newPassword")} value={form.next} onChange={(e) => setForm({ ...form, next: e.target.value })} className={cls} />
              <input required type="password" autoComplete="new-password" minLength={6} placeholder={t("confirmPassword")} value={form.confirm} onChange={(e) => setForm({ ...form, confirm: e.target.value })} className={cls} />
              {error && (
                <p role="alert" className="text-sm text-red-600">
                  {error}
                </p>
              )}
              <button type="submit" disabled={saving} className="w-full py-3 rounded-lg bg-primary-600 hover:bg-primary-700 text-white font-semibold disabled:opacity-50">
                {saving ? t("saving") : t("savePassword")}
              </button>
            </>
          )}
        </form>
      </div>
    </div>
  );
}
