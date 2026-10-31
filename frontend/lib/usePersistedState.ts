import { useCallback, useState } from 'react';

// State lưu vào localStorage (dùng cho dữ liệu demo của admin).
// Chỉ dùng trong component render sau khi mount phía client (admin layout đảm bảo điều này).
export function usePersistedState<T>(key: string, initial: T) {
  const [value, setValue] = useState<T>(() => {
    try {
      const raw = localStorage.getItem(key);
      return raw ? (JSON.parse(raw) as T) : initial;
    } catch {
      return initial;
    }
  });

  const update = useCallback(
    (next: T | ((prev: T) => T)) => {
      setValue((prev) => {
        const resolved = typeof next === 'function' ? (next as (p: T) => T)(prev) : next;
        try {
          localStorage.setItem(key, JSON.stringify(resolved));
        } catch {
          // bỏ qua nếu storage đầy/bị chặn
        }
        return resolved;
      });
    },
    [key],
  );

  return [value, update] as const;
}
