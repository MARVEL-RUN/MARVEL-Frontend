import type { Metadata } from "next";
import { VirtualRunTicketsPage } from "@/components/virtual-run/VirtualRunTicketsPage";

export const metadata: Metadata = { title: "티켓 구매" };

export default function Page() {
  return <VirtualRunTicketsPage />;
}
