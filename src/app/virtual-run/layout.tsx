import type { Metadata } from "next";
import { VirtualRunShell } from "@/components/virtual-run/layout/VirtualRunShell";
import { VIRTUAL_RUN_ASSETS } from "@/lib/virtual-run/assets";
import {
  VIRTUAL_RUN_OG_DESCRIPTION,
  VIRTUAL_RUN_OG_TITLE,
} from "@/lib/virtual-run/event";

export const metadata: Metadata = {
  title: {
    default: "MARVEL RUN 2026 버추얼런",
    template: "%s | MARVEL RUN 버추얼런",
  },
  description: VIRTUAL_RUN_OG_DESCRIPTION,
  openGraph: {
    title: VIRTUAL_RUN_OG_TITLE,
    description: VIRTUAL_RUN_OG_DESCRIPTION,
    locale: "ko_KR",
    type: "website",
    images: [
      {
        url: VIRTUAL_RUN_ASSETS.og,
        width: 2400,
        height: 1260,
        alt: VIRTUAL_RUN_OG_TITLE,
      },
    ],
  },
  twitter: {
    card: "summary_large_image",
    title: VIRTUAL_RUN_OG_TITLE,
    description: VIRTUAL_RUN_OG_DESCRIPTION,
    images: [VIRTUAL_RUN_ASSETS.og],
  },
};

export default function VirtualRunLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <VirtualRunShell>{children}</VirtualRunShell>;
}
