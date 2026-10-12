import type { Metadata } from "next";
import { OnsiteProgramPage } from "@/components/main/guide/onsite/OnsiteProgramPage";

export const metadata: Metadata = {
  title: "현장프로그램",
  description: "2026 마블런 현장 체험·부스 프로그램 안내",
};

export default function Page() {
  return <OnsiteProgramPage />;
}
