import type { Metadata } from "next";
import { VirtualRunPackageUpgrade } from "@/components/virtual-run/mypage/VirtualRunPackageUpgrade";

export const metadata: Metadata = { title: "패키지 상향" };

export default function Page() {
  return <VirtualRunPackageUpgrade />;
}
