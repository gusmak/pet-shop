"use client";

import { useState } from "react";
import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { KeyRound } from "lucide-react";
import { api } from "@/lib/api";

export default function ForgotPasswordPage() {
  const t = useTranslations("auth");
  const locale = useLocale();
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(false);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    const res = await api.post("/api/auth/forgot-password", { email, locale });
    setLoading(false);
    if (!res.data) return setError(res.error || t("resetFailed"));
    setSent(true);
  };

  return (
    <div className="flex justify-center px-4 py-16 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center mb-4">
            <KeyRound className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900">{t("forgotTitle")}</h1>
        </div>

        {sent ? (
          <div role="status" className="bg-green-50 border border-green-200 text-green-800 px-4 py-4 rounded-lg text-sm">
            {t("forgotSent")}
          </div>
        ) : (
          <form onSubmit={submit} className="space-y-5">
            <p className="text-gray-600 text-sm">{t("forgotIntro")}</p>
            <input
              required
              type="email"
              autoComplete="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder={t("emailPlaceholder")}
              className="w-full h-14 px-4 border border-gray-300 rounded-lg bg-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500"
            />
            {error && (
              <div role="alert" className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full h-14 bg-primary-600 hover:bg-primary-700 text-white font-bold uppercase tracking-wide rounded-lg shadow-md transition-colors disabled:opacity-50"
            >
              {loading ? t("sending") : t("sendLink")}
            </button>
          </form>
        )}

        <p className="text-center text-sm mt-6">
          <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            {t("backToLogin")}
          </Link>
        </p>
      </div>
    </div>
  );
}
