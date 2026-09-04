import type { Metadata } from "next";
import { Archivo } from "next/font/google";
import "./globals.css";

const archivo = Archivo({
  subsets: ["latin"],
  weight: ["600", "700"],
  variable: "--font-archivo",
});

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
          rel="stylesheet"
          href="https://cdn.jsdelivr.net/gh/orioncactus/pretendard@v1.3.9/dist/web/variable/pretendardvariable-dynamic-subset.min.css"
        />
      </head>
      <body className={archivo.variable}>{children}</body>
    </html>
  );
}
