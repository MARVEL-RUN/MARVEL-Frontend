import type { Metadata, Viewport } from "next";
import "./globals.css";
import { GoogleAnalytics } from "./GoogleAnalytics";
import { NaverAnalytics } from "./NaverAnalytics";

const googleVerification = process.env.GOOGLE_SITE_VERIFICATION;
const naverVerification = process.env.NAVER_SITE_VERIFICATION;

export const metadata: Metadata = {
  title: "MARVEL RUN 2026 KOREA",
  description:
    "2026년 10월 31일 토요일 인제스피디움. 접수는 2026년 9월 22일 화요일 오후 2시에 시작합니다.",
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
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <body>
        {children}
        <GoogleAnalytics measurementId={process.env.GA_MEASUREMENT_ID} />
        <NaverAnalytics waId={process.env.NAVER_ANALYTICS_ID} />
      </body>
    </html>
  );
}
