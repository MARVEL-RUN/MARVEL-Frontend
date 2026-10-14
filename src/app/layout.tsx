import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { OG_DESCRIPTION, OG_TITLE, SEO_TITLE, SITE_URL } from "@/lib/event";
import { APP_MODE, isMain } from "@/lib/mode";
import { PREVIEW_BASE_PATH } from "@/lib/preview";
import { BgmPlayer } from "@/components/main/layout/BgmPlayer";
import { BGM_SRC } from "@/lib/main/config";
import { SiteZoom } from "@/components/main/layout/SiteZoom";
import "./globals.css";
import { GoogleAnalytics } from "./GoogleAnalytics";
import { NaverAnalytics } from "./NaverAnalytics";

/* 빌드 때 구글 폰트를 받지 않도록 런타임 link로. 공지 본문(.notice-body)에서만 씀 */
const NOTO_SANS_KR_CSS =
  "https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap";

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;
const naverVerification = process.env.NAVER_SITE_VERIFICATION;

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: {
    default: SEO_TITLE,
    template: "%s | 마블런 2026",
  },
  description: OG_DESCRIPTION,
  formatDetection: {
    telephone: false,
    email: false,
    address: false,
    date: false,
    url: false,
  },
  openGraph: {
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    url: SITE_URL,
    siteName: "마블런 2026",
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: "/og.jpg",
        width: 1024,
        height: 537,
        alt: OG_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: OG_TITLE,
    description: OG_DESCRIPTION,
    images: ["/og.jpg"],
  },
  verification: {
    ...(googleVerification ? { google: googleVerification } : {}),
    ...(naverVerification
      ? { other: { "naver-site-verification": naverVerification } }
      : {}),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
  interactiveWidget: "overlays-content",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko" suppressHydrationWarning>
      <head>
        <link rel="preconnect" href="https://fonts.googleapis.com" />
        <link rel="preconnect" href="https://fonts.gstatic.com" crossOrigin="anonymous" />
        <link rel="stylesheet" href={NOTO_SANS_KR_CSS} />
      </head>
      <body>
        <Script id="site-zoom-guard" strategy="beforeInteractive">
          {`(function(){var p=location.pathname;if(p.indexOf("/admin")===0)return;var preview=${JSON.stringify(PREVIEW_BASE_PATH)};var onPreview=p===preview||p.indexOf(preview+"/")===0;if(${JSON.stringify(APP_MODE)}!=="main"&&!onPreview)return;document.documentElement.classList.add("is-main");if(p!=="/"&&p!==""){document.documentElement.classList.add("is-live");}})();`}
        </Script>
        <SiteZoom />
        {children}
        {isMain && BGM_SRC ? <BgmPlayer src={BGM_SRC} /> : null}
        <GoogleAnalytics measurementId={process.env.GA_MEASUREMENT_ID} />
        <NaverAnalytics waId={process.env.NAVER_ANALYTICS_ID} />
      </body>
    </html>
  );
}
