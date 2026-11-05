import type { Metadata } from "next";
import { VirtualRunRegistrationEdit } from "@/components/virtual-run/mypage/VirtualRunRegistrationEdit";

export const metadata: Metadata = { title: "신청 정보 수정" };

export default function Page() {
  return <VirtualRunRegistrationEdit />;
}
