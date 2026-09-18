import type { Metadata } from "next";
import { VirtualRunPage } from "@/components/main/virtual/VirtualRunPage";

export const metadata: Metadata = {
  title: "버추얼런",
};

export default function Page() {
  return <VirtualRunPage />;
}
