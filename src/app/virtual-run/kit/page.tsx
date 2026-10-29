import type { Metadata } from "next";
import { VirtualRunKitPage } from "@/components/virtual-run/kit/VirtualRunKitPage";

export const metadata: Metadata = {
  title: "기념품",
};

export default function Page() {
  return <VirtualRunKitPage />;
}
