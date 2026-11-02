import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { VirtualRunSpotsPage } from "@/components/virtual-run/mypage/VirtualRunSpotsPage";
import { virtualRunSpotsEnabled } from "@/lib/virtual-run/site";

export const metadata: Metadata = { title: "거점 이벤트" };

export default function Page() {
  if (!virtualRunSpotsEnabled) {
    notFound();
  }

  return <VirtualRunSpotsPage />;
}
