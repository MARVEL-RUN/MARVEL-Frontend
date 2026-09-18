import type { Metadata } from "next";
import { GuidePage } from "@/components/main/guide/GuidePage";

export const metadata: Metadata = {
  title: "대회안내",
};

export default function Page() {
  return <GuidePage />;
}
