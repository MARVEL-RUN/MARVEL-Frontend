import type { Metadata } from "next";
import { VirtualRunEventSchedulePage } from "@/components/virtual-run/event/VirtualRunEventSchedulePage";

export const metadata: Metadata = { title: "운영 일정" };

export default function Page() {
  return <VirtualRunEventSchedulePage />;
}
