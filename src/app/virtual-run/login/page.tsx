import type { Metadata } from "next";
import { VirtualRunLoginPage } from "@/components/virtual-run/login/VirtualRunLoginPage";

export const metadata: Metadata = { title: "참가자 로그인" };

export default function Page() {
  return <VirtualRunLoginPage />;
}
