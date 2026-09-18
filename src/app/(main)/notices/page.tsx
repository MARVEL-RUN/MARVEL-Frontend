import type { Metadata } from "next";
import { NoticesPage } from "@/components/main/notices/NoticesPage";

export const metadata: Metadata = {
  title: "공지사항",
};

export default function Page() {
  return <NoticesPage />;
}
