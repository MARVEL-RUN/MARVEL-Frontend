import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VirtualRunMypageSection } from "@/components/virtual-run/VirtualRunMypageSection";
import { virtualRunSpotsEnabled } from "@/lib/virtual-run/site";

export const metadata: Metadata = { title: "거점 이벤트" };

export default function Page() {
  if (!virtualRunSpotsEnabled) {
    notFound();
  }

  return (
    <VirtualRunMypageSection
      title="거점 이벤트"
      lead="협업 거점 방문 인증 및 이벤트 안내입니다."
    />
  );
}
