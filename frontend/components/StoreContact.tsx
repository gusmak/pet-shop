"use client";

import type { AnchorHTMLAttributes } from "react";
import { useStore, formatPhone, telHref, zaloHref } from "@/lib/store";
import { minPriceOf, useCatalog } from "@/lib/catalog";
import GoogleMap from "@/components/GoogleMap";

// Các mảnh nhỏ hiển thị thông tin cửa hàng từ DB; dùng được cả trong server component.
// Chưa tải xong thì không render gì (không hiện số/địa chỉ cứng).

type AnchorProps = Omit<AnchorHTMLAttributes<HTMLAnchorElement>, "href">;

export const StorePhone = () => {
  const s = useStore();
  return <>{s ? formatPhone(s.phone) : ""}</>;
};

// Thay {phone} {email} {address} {hours} {hoursShort} {serviceCount} {spaFrom} trong chuỗi dịch bằng dữ liệu thật.
export function StoreText({ template }: { template: string }) {
  const s = useStore();
  const catalog = useCatalog();
  const needsCatalog = /{(serviceCount|spaFrom)}/.test(template);
  if (!s || (needsCatalog && !catalog)) return null;
  const spa = catalog?.filter((c) => c.category.slug === 'spa-tam') ?? [];
  const map: Record<string, string> = {
    phone: formatPhone(s.phone),
    email: s.email ?? '',
    address: s.address,
    hours: `${s.openTime} – ${s.closeTime}`,
    hoursShort: `${Number(s.openTime.slice(0, 2))}–${Number(s.closeTime.slice(0, 2))}h`,
    serviceCount: String(catalog?.length ?? ''),
    spaFrom: spa.length ? `${Math.round(Math.min(...spa.map(minPriceOf)) / 1000)}K` : '',
  };
  return <>{template.replace(/{(phone|email|address|hours|hoursShort|serviceCount|spaFrom)}/g, (_, k: string) => map[k])}</>;
}

export const StoreEmail = () => <>{useStore()?.email ?? ""}</>;

export const StoreAddress = () => <>{useStore()?.address ?? ""}</>;

export function StorePhoneLink(props: AnchorProps) {
  const s = useStore();
  return s ? <a href={telHref(s.phone)} {...props} /> : null;
}

export function StoreZaloLink(props: AnchorProps) {
  const s = useStore();
  return s ? <a href={zaloHref(s)} target="_blank" rel="noopener noreferrer" {...props} /> : null;
}

export function StoreEmailLink(props: AnchorProps) {
  const s = useStore();
  return s?.email ? <a href={`mailto:${s.email}`} {...props} /> : null;
}

export function StoreMap({ height }: { height?: string }) {
  const s = useStore();
  if (!s || s.latitude == null || s.longitude == null) return null;
  return <GoogleMap latitude={s.latitude} longitude={s.longitude} address={s.address} height={height} />;
}
