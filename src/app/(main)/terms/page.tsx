import type { Metadata } from "next";
import { TermsPage } from "@/components/main/legal/TermsPage";

export const metadata: Metadata = {
  title: "이용약관",
};

export default function Page() {
  return <TermsPage />;
}
