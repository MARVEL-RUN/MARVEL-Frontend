"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

export function NaverAnalytics({ waId }: { waId?: string }) {
  const pathname = usePathname();
  if (!waId || pathname.startsWith("/admin")) return null;

  return (
    <Script
      src="https://wcs.pstatic.net/wcslog.js"
      strategy="afterInteractive"
      onLoad={() => {
        const w = window as Window & {
          wcs?: unknown;
          wcs_add?: Record<string, string>;
          wcs_do?: () => void;
        };
        w.wcs_add = w.wcs_add ?? {};
        w.wcs_add.wa = waId;
        if (w.wcs) w.wcs_do?.();
      }}
    />
  );
}
