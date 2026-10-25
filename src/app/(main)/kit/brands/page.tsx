import type { Metadata } from "next";
import { BrandsPage } from "@/components/main/brands/BrandsPage";

export const metadata: Metadata = {
  title: "브랜드",
  description: "2026 마블런과 함께하는 브랜드·파트너",
};

export default function Page() {
  return <BrandsPage />;
}
