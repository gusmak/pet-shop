"use client";

import { useEffect, useSyncExternalStore } from "react";
import { api } from "@/lib/api";

// Danh mục dịch vụ công khai (giá lấy từ database) — dùng chung, chỉ tải một lần cho cả trang.
export interface CatalogService {
  slug: string;
  name: string;
  basePrice: number;
  variants: { size: string; price: number }[];
  category: { slug: string };
}

let snapshot: CatalogService[] | null = null;
let inflight = false;
const listeners = new Set<() => void>();

function load() {
  if (inflight || snapshot) return;
  inflight = true;
  void api.get<CatalogService[]>("/api/services").then((res) => {
    inflight = false;
    if (res.data) {
      snapshot = res.data;
      listeners.forEach((l) => l());
    }
  });
}

export function useCatalog(): CatalogService[] | null {
  useEffect(load, []);
  return useSyncExternalStore(
    (cb) => {
      listeners.add(cb);
      return () => listeners.delete(cb);
    },
    () => snapshot,
    () => null,
  );
}

// Giá thấp nhất của một dịch vụ (mọi size) / của một nhóm dịch vụ.
export const minPriceOf = (s: CatalogService) => Math.min(s.basePrice, ...s.variants.map((v) => v.price));
