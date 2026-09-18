import type { Metadata } from "next";
import { KitPage } from "@/components/main/kit/KitPage";

export const metadata: Metadata = {
  title: "기념품",
};

export default function Page() {
  return <KitPage />;
}
