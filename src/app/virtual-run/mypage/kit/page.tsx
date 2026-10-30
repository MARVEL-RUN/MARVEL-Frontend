import type { Metadata } from "next";
import { VirtualRunMypageSection } from "@/components/virtual-run/mypage/VirtualRunMypageSection";

export const metadata: Metadata = { title: "키트 카드" };

export default function Page() {
  return (
    <VirtualRunMypageSection
      title="키트 카드"
      lead="배송 상태와 키트 인증을 확인합니다."
    />
  );
}
