"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link, useRouter } from "@/i18n/navigation";
import { UserPlus } from "lucide-react";
import { api } from "@/lib/api";
import { DEMO_MODE, DEMO_TOKEN, readAccounts, writeAccounts, type DemoAccount, type DemoUser } from "@/lib/demo";
import { saveSession } from "@/lib/useAuth";

interface RegisterResponse {
  accessToken: string;
  user: DemoUser;
}

export default function RegisterPage() {
  const t = useTranslations("auth");
  const router = useRouter();
  const [form, setForm] = useState({ fullName: "", phone: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement>) =>
    setForm({ ...form, [k]: e.target.value });

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      if (DEMO_MODE) {
        const accounts = readAccounts();
        if (accounts.some((a) => a.email.toLowerCase() === form.email.toLowerCase())) {
          return setError(t("emailTaken"));
        }
        const account: DemoAccount = {
          id: crypto.randomUUID(),
          email: form.email,
          password: form.password,
          name: form.fullName,
          phone: form.phone,
          role: "customer",
        };
        writeAccounts([...accounts, account]);
        const { password, ...user } = account;
        void password;
        saveSession(DEMO_TOKEN, user);
      } else {
        const res = await api.post<RegisterResponse>("/api/auth/register", {
          email: form.email,
          password: form.password,
          fullName: form.fullName,
          phone: form.phone || undefined,
        });
        if (!res.data) return setError(res.error || t("registerFailed"));
        saveSession(res.data.accessToken, res.data.user);
      }
      router.push("/account");
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    "w-full h-14 px-4 border border-gray-300 rounded-lg bg-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors";

  return (
    <div className="flex justify-center px-4 py-16 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center mb-4">
            <UserPlus className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">{t("register")}</h1>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <input required value={form.fullName} onChange={set("fullName")} placeholder={`${t("fullNamePlaceholder")} *`} aria-label={t("fullNamePlaceholder")} autoComplete="name" className={inputCls} />
          <input type="tel" value={form.phone} onChange={set("phone")} placeholder={t("phonePlaceholder")} aria-label={t("phonePlaceholder")} autoComplete="tel" className={inputCls} />
          <input required type="email" value={form.email} onChange={set("email")} placeholder={`${t("emailPlaceholder")} *`} aria-label={t("emailPlaceholder")} autoComplete="email" className={inputCls} />
          <input required minLength={6} type="password" value={form.password} onChange={set("password")} placeholder={`${t("passwordPlaceholder2")} *`} aria-label={t("passwordPlaceholder2")} autoComplete="new-password" className={inputCls} />

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
            {loading ? t("registerLoading") : t("register")}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          {t("hasAccount")}{" "}
          <Link href="/login" className="font-semibold text-primary-600 hover:text-primary-700">
            {t("loginLink")}
          </Link>
        </p>
      </div>
    </div>
  );
}