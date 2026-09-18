import type { Metadata } from "next";
import { LookupPage } from "@/components/main/lookup/LookupPage";

export const metadata: Metadata = {
  title: "신청조회",
};

export default function Page() {
  return <LookupPage />;
}
