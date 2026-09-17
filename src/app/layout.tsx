import type { Metadata, Viewport } from "next";
import { Noto_Sans_KR } from "next/font/google";
import Script from "next/script";
import { EVENT, OG_DESCRIPTION, OG_TITLE } from "@/lib/event";
import { APP_MODE } from "@/lib/mode";
import { SiteZoom } from "@/components/main/layout/SiteZoom";
import "./globals.css";
import { GoogleAnalytics } from "./GoogleAnalytics";
import { NaverAnalytics } from "./NaverAnalytics";

const notoSansKr = Noto_Sans_KR({
  subsets: ["latin"],
  weight: ["400", "700"],
  display: "swap",
  variable: "--font-noto",
});

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;
const naverVerification = process.env.NAVER_SITE_VERIFICATION;

const SITE_URL = "https://marvelrunkorea2026.com";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: EVENT.title,
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
    siteName: EVENT.title,
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
    <html lang="ko" className={notoSansKr.variable} suppressHydrationWarning>
      <body>
        <Script id="site-zoom-guard" strategy="beforeInteractive">
          {`(function(){var p=location.pathname;if(p.indexOf("/admin")===0)return;if(${JSON.stringify(APP_MODE)}!=="main")return;document.documentElement.classList.add("is-main");if((p==="/"||p==="")&&!matchMedia("(prefers-reduced-motion: reduce)").matches){document.documentElement.classList.add("is-intro");}})();`}
        </Script>
        <SiteZoom />
        {children}
        <GoogleAnalytics measurementId={process.env.GA_MEASUREMENT_ID} />
        <NaverAnalytics waId={process.env.NAVER_ANALYTICS_ID} />
      </body>
    </html>
  );
}
