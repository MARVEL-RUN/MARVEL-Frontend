import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "MARVEL RUN 2026 KOREA",
  description:
    "2026년 10월 31일 토요일 인제스피디움. 접수는 2026년 9월 22일 화요일 오후 2시에 시작합니다.",
};

export default function RootLayout({
  children,
}: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="ko">
      <head>
        <link
          rel="preload"
          href="/fonts/bm-dohyeon.woff2"
          as="font"
          type="font/woff2"
          crossOrigin="anonymous"
        />
        <link
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body>{children}</body>
    </html>
  );
}
