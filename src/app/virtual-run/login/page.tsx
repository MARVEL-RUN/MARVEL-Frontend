import type { Metadata } from "next";
import { VirtualRunLoginPage } from "@/components/virtual-run/VirtualRunLoginPage";

export const metadata: Metadata = { title: "로그인" };

export default function Page() {
  return <VirtualRunLoginPage />;
}
