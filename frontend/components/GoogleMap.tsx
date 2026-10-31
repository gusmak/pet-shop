"use client";

import { useLocale, useTranslations } from "next-intl";

interface GoogleMapProps {
  latitude?: number;
  longitude?: number;
  address?: string;
  height?: string;
}

export default function GoogleMap({
  latitude = 21.005,
  longitude = 105.825,
  address = "7 Chùa Bộc, Đống Đa, Hà Nội",
  height = "400px",
}: GoogleMapProps) {
  const locale = useLocale();
  const t = useTranslations("map");

  const mapUrl = `https://maps.google.com/maps?q=${latitude},${longitude}&z=16&hl=${locale}&output=embed`;

  const directionUrl = `https://www.google.com/maps/dir/?api=1&destination=${latitude},${longitude}`;

  return (
    <div className="w-full rounded-lg overflow-hidden shadow-lg">
      <iframe
        src={mapUrl}
        width="100%"
        height={height}
        style={{ border: 0 }}
        allowFullScreen
        loading="lazy"
        referrerPolicy="no-referrer-when-downgrade"
        title={`${t("title")} - ${address}`}
      />
      <div className="bg-white p-4 border-t">
        <div className="flex items-center justify-between gap-4">
          <div className="flex-1">
            <h3 className="font-semibold text-gray-900">{t("title")}</h3>
            <p className="text-sm text-gray-600 mt-1">{address}</p>
          </div>
          <a
            href={directionUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="bg-primary-600 hover:bg-primary-700 text-white px-6 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap"
          >
            {t("direction")}
          </a>
        </div>
      </div>
    </div>
  );
}