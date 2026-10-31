const API_BASE = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

interface ApiResponse<T = unknown> {
  data?: T;
  error?: string;
  status: number;
}

async function request<T>(
  endpoint: string,
  options: RequestInit = {},
): Promise<ApiResponse<T>> {
  const token = typeof window !== 'undefined' ? localStorage.getItem('accessToken') : null;

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...((options.headers as Record<string, string>) || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  try {
    const res = await fetch(`${API_BASE}${endpoint}`, {
      ...options,
      headers,
    });

    const data = await res.json().catch(() => null);

    if (res.status === 401 && token) {
      localStorage.removeItem('accessToken');
      localStorage.removeItem('authUser');
      window.dispatchEvent(new Event('auth-change'));
    }

    if (!res.ok) {
      return {
        // NestJS trả mảng message khi validate nhiều trường
        error: Array.isArray(data?.message) ? data.message.join('; ') : data?.message || `Lỗi ${res.status}`,
        status: res.status,
      };
    }

    return { data, status: res.status };
  } catch {
    return { error: 'Không thể kết nối đến server', status: 0 };
  }
}

export const api = {
  get: <T>(endpoint: string) => request<T>(endpoint),
  post: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'POST', body: JSON.stringify(body) }),
  put: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PUT', body: JSON.stringify(body) }),
  patch: <T>(endpoint: string, body: unknown) =>
    request<T>(endpoint, { method: 'PATCH', body: JSON.stringify(body) }),
  delete: <T>(endpoint: string) => request<T>(endpoint, { method: 'DELETE' }),
};
