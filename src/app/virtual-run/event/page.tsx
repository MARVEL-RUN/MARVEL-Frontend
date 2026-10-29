import type { Metadata } from "next";
import { VirtualRunEventPage } from "@/components/virtual-run/VirtualRunEventPage";

export const metadata: Metadata = { title: "행사 안내" };

export default function Page() {
  return <VirtualRunEventPage />;
}
