import type { Metadata } from "next";
import { VirtualRunMypageSection } from "@/components/virtual-run/VirtualRunMypageSection";

export const metadata: Metadata = { title: "리워드 내역" };

export default function Page() {
  return (
    <VirtualRunMypageSection
      title="리워드 내역"
      lead="리워드 발송 내역과 재요청을 처리합니다."
    />
  );
}
