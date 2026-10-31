'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Eye, EyeOff, Lock } from 'lucide-react';
import { api } from '@/lib/api';
import { DEMO_MODE, DEMO_TOKEN, readAccounts, type DemoAccount, type DemoUser } from '@/lib/demo';
import { saveSession } from '@/lib/useAuth';
import { getGroupPermissions, homeFor } from '@/lib/permissions';

interface LoginResponse {
  accessToken: string;
  user: DemoUser;
}

const withoutPassword = ({ password, ...user }: DemoAccount): DemoUser => {
  void password;
  return user;
};

export default function LoginPage() {
  const router = useRouter();
  const [identifier, setIdentifier] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const finish = (token: string, user: DemoUser) => {
    saveSession(token, user);
    router.push(homeFor(getGroupPermissions(user.role)));
  };

  const demoLogin = () => {
    const account = readAccounts().find(
      (a) => (a.email === identifier || (a.phone && a.phone === identifier)) && a.password === password,
    );
    if (!account) return setError('Tên tài khoản hoặc mật khẩu không đúng');
    finish(DEMO_TOKEN, withoutPassword(account));
  };

  const realLogin = async () => {
    // Một endpoint chung: backend tự nhận nhân viên (email) hoặc khách (email/SĐT).
    const res = await api.post<LoginResponse>('/api/auth/login', { identifier, password });
    if (!res.data) return setError(res.error || 'Đăng nhập thất bại');
    finish(res.data.accessToken, res.data.user);
  };

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      if (DEMO_MODE) demoLogin();
      else await realLogin();
    } finally {
      setLoading(false);
    }
  };

  const inputCls =
    'w-full h-14 px-4 border border-gray-300 rounded-lg bg-white focus:border-primary-500 focus:outline-none focus:ring-1 focus:ring-primary-500 transition-colors';

  return (
    <div className="flex justify-center px-4 py-16 bg-gray-50">
      <div className="w-full max-w-md">
        <div className="flex flex-col items-center mb-8">
          <div className="w-14 h-14 rounded-full bg-primary-600 flex items-center justify-center mb-4">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-4xl font-bold text-gray-900">Đăng nhập</h1>
        </div>

        <form onSubmit={submit} className="space-y-5">
          <div>
            <label htmlFor="identifier" className="sr-only">Tên tài khoản hoặc email</label>
            <input
              id="identifier"
              required
              autoComplete="username"
              value={identifier}
              onChange={(e) => setIdentifier(e.target.value)}
              placeholder="Tên tài khoản hoặc email *"
              className={inputCls}
            />
          </div>

          <div>
            <label htmlFor="password" className="sr-only">Mật khẩu</label>
            <div className="relative">
              <input
                id="password"
                required
                autoComplete="current-password"
                type={showPassword ? 'text' : 'password'}
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="Mật khẩu *"
                className={`${inputCls} pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword((v) => !v)}
                aria-label={showPassword ? 'Ẩn mật khẩu' : 'Hiện mật khẩu'}
                className="absolute inset-y-0 right-3 flex items-center text-gray-500 hover:text-gray-700"
              >
                {showPassword ? <EyeOff className="w-6 h-6" /> : <Eye className="w-6 h-6" />}
              </button>
            </div>
            <div className="text-right mt-2">
              <Link href="/contact" className="text-sm text-blue-600 hover:text-blue-700">
                Quên mật khẩu?
              </Link>
            </div>
          </div>

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
            {loading ? 'Đang đăng nhập...' : 'Đăng nhập'}
          </button>
        </form>

        <p className="text-center text-sm text-gray-600 mt-6">
          Chưa có tài khoản?{' '}
          <Link href="/register" className="font-semibold text-primary-600 hover:text-primary-700">
            Đăng ký
          </Link>
        </p>

        {DEMO_MODE && (
          <p className="text-center text-xs text-gray-400 mt-8">
            Demo: admin@petshop.vn / admin123 · monitor@petshop.vn / monitor123 · khach@petshop.vn / khach123
          </p>
        )}
      </div>
    </div>
  );
}
