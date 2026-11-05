import type { Metadata } from "next";
import { VirtualRunNoticesPage } from "@/components/virtual-run/community/notices/VirtualRunNoticesPage";

export const metadata: Metadata = { title: "공지사항" };

export default function Page() {
  return <VirtualRunNoticesPage />;
}
