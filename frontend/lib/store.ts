"use client";

import { useEffect, useSyncExternalStore } from "react";
import { api } from "@/lib/api";

// Thông tin cửa hàng lấy từ backend (/api/settings) — admin sửa ở trang "Hệ thống" là website đổi theo.
export interface StoreInfo {
  name: string;
  address: string;
  phone: string; // dạng lưu trong DB, vd 0971616634
  email: string | null;
  zaloLink: string | null;
  openTime: string;
  closeTime: string;
  latitude: number | null;
  longitude: number | null;
}

type Snapshot = { loaded: boolean; store: StoreInfo | null };

// Chưa tải xong (hoặc backend lỗi/demo): không hiển thị số/địa chỉ nào thay vì hiện số cũ cứng trong code.
const EMPTY: Snapshot = { loaded: false, store: null };

let snapshot: Snapshot = EMPTY;
let inflight: Promise<void> | null = null;
const listeners = new Set<() => void>();

const emit = () => listeners.forEach((l) => l());

function load() {
  if (inflight || snapshot.loaded) return;
  inflight = api.get<StoreInfo>("/api/settings").then((res) => {
    if (res.data) {
      snapshot = { loaded: true, store: res.data };
      emit();
    }
    inflight = null; // lỗi: lần mount sau sẽ thử lại
  });
}

export function useStore(): StoreInfo | null {
  useEffect(load, []);
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => snapshot.store,
    () => null,
  );
}

// 0971616634 -> "0971 616 634"
export const formatPhone = (p: string) => (/^\d{10}$/.test(p) ? p.replace(/(\d{4})(\d{3})(\d{3})/, "$1 $2 $3") : p);

export const telHref = (p: string) => `tel:${p.replace(/\s+/g, "")}`;

// Không cấu hình link Zalo riêng thì dùng zalo.me/<số điện thoại>.
export const zaloHref = (s: StoreInfo) => s.zaloLink || `https://zalo.me/${s.phone.replace(/\s+/g, "")}`;
