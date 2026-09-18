import type { Metadata } from "next";
import { PrivacyPage } from "@/components/main/legal/PrivacyPage";

export const metadata: Metadata = {
  title: "개인정보 처리방침",
};

export default function Page() {
  return <PrivacyPage />;
}
