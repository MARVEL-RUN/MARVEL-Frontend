import type { Metadata } from "next";
import { VirtualRunShell } from "@/components/virtual-run/VirtualRunShell";

export const metadata: Metadata = {
  title: {
    default: "MARVEL RUN 2026 버추얼런",
    template: "%s | MARVEL RUN 버추얼런",
  },
  description:
    "MARVEL RUN 2026 버추얼런 — 전국 어디서나 5K 러닝·키트·거점 인증 이벤트",
};

export default function VirtualRunLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <VirtualRunShell>{children}</VirtualRunShell>;
}
