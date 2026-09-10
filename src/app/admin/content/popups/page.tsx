import type { Metadata } from "next";
import { PopupsPage } from "@/components/admin/content/popups/PopupsPage";

export const metadata: Metadata = {
  title: "팝업 | 관리자",
};

export default function Page() {
  return <PopupsPage />;
}
