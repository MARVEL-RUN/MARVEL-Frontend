import type { Metadata } from "next";
import { PrecautionsPage } from "@/components/main/precautions/PrecautionsPage";

export const metadata: Metadata = {
  title: "참가자 유의사항",
};

export default function Page() {
  return <PrecautionsPage />;
}
