import type { Metadata } from "next";
import { VirtualRunMypageSection } from "@/components/virtual-run/mypage/VirtualRunMypageSection";

export const metadata: Metadata = { title: "회차 카드" };

export default function Page() {
  return (
    <VirtualRunMypageSection
      title="회차 카드"
      lead="회차별 러닝 인증과 완주증을 관리합니다."
    />
  );
}
