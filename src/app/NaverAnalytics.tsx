"use client";

import Script from "next/script";
import { usePathname } from "next/navigation";

const WA_ID = "1c32bbcf7d05d90";

export function NaverAnalytics() {
  const pathname = usePathname();
  if (pathname.startsWith("/admin")) return null;

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
        w.wcs_add.wa = WA_ID;
        if (w.wcs) w.wcs_do?.();
      }}
    />
  );
}
