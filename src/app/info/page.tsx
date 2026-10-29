import type { Metadata, Viewport } from "next";
import Image from "next/image";
import { InfoTopButton } from "@/components/main/info/InfoTopButton";
import "./info.css";

/** 첫 장(행사장) 상단 연회색 — 사파리 상태바·주소창 틴트 */
const INFO_THEME = "#e0e0e0";

export const metadata: Metadata = {
  title: "안내",
};

export const viewport: Viewport = {
  themeColor: INFO_THEME,
  colorScheme: "light",
};

const SHEETS = [
  { src: "/images/info/1.png", alt: "행사장과 피니셔 키트", width: 1500, height: 7349 },
  { src: "/images/info/2.png", alt: "위치와 현장 프로그램", width: 1500, height: 8945 },
  { src: "/images/info/3.png", alt: "대회 유의사항", width: 1501, height: 7257 },
  { src: "/images/info/4.png", alt: "코스와 타임테이블", width: 1500, height: 7849 },
] as const;

export default function InfoPage() {
  return (
    <main className="info-sheet">
      {SHEETS.map((sheet, index) => (
        <Image
          key={sheet.src}
          src={sheet.src}
          alt={sheet.alt}
          width={sheet.width}
          height={sheet.height}
          sizes="100vw"
          {...(index === 0 ? { priority: true } : { loading: "eager" as const })}
          draggable={false}
          className="info-sheet__img"
        />
      ))}
      <InfoTopButton />
    </main>
  );
}
