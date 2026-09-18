import type { Metadata } from "next";
import { FaqPage } from "@/components/main/faq/FaqPage";

export const metadata: Metadata = {
  title: "FAQ",
};

export default function Page() {
  return <FaqPage />;
}
