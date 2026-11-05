"use client";

import { Suspense, useState } from "react";
import { useSearchParams } from "next/navigation";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { KeyRound } from "lucide-react";
import { api } from "@/lib/api";

function ResetForm() {
  const t = useTranslations("auth");
  const token = useSearchParams().get("token") ?? "";
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [done, setDone] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    if (password !== confirm) return setError(t("passwordMismatch"));
    setLoading(true);
    const res = await api.post("/api/auth/reset-password", { token, newPassword: password });
    setLoading(false);
    if (!res.data) return setError(res.error || t("resetFailed"));
    setDone(true);
  };

  const inputCls =
    "w-full h-14 px-4 border border-gray-300 rounded-lg bg-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500";

  if (!token) {
    return (
      <div className="space-y-4 text-center">
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-4 rounded-lg text-sm">
          {t("missingToken")}
        </div>
        <Link href="/forgot-password" className="font-semibold text-primary-600 hover:text-primary-700">
          {t("requestNew")}
        </Link>
      </div>
    );
  }

  if (done) {
    return (
      <div className="space-y-4 text-center">
        <div role="status" className="bg-green-50 border border-green-200 text-green-800 px-4 py-4 rounded-lg text-sm">
          {t("resetDone")}
        </div>
        <Link href="/login" className="inline-block w-full h-14 leading-[3.5rem] bg-primary-600 hover:bg-primary-700 text-white font-bold uppercase tracking-wide rounded-lg shadow-md">
          {t("login")}
        </Link>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="space-y-5">
      <input required type="password" autoComplete="new-password" minLength={6} value={password} onChange={(e) => setPassword(e.target.value)} placeholder={t("newPassword")} className={inputCls} />
      <input required type="password" autoComplete="new-password" minLength={6} value={confirm} onChange={(e) => setConfirm(e.target.value)} placeholder={t("confirmPassword")} className={inputCls} />
      {error && (
        <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
          {error}{" "}
          <Link href="/forgot-password" className="underline">
            {t("requestNew")}
          </Link>
        </div>
      )}
      <button
        type="submit"
        disabled={loading}
        className="w-full h-14 bg-primary-600 hover:bg-primary-700 text-white font-bold uppercase tracking-wide rounded-lg shadow-md transition-colors disabled:opacity-50"
      >
        {loading ? t("sending") : t("saveNewPassword")}
      </button>
    </form>
  );
}

export default function ResetPasswordPage() {
  const t = useTranslations("auth");
  return (
    <div className="flex justify-center px-4 py-16 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center mb-4">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t("resetTitle")}</h1>
        </div>
        <Suspense fallback={null}>
          <ResetForm />
        </Suspense>
      </div>
    </div>
  );
}
