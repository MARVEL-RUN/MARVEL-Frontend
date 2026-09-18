import type { Metadata } from "next";
import { DirectionsPage } from "@/components/main/directions/DirectionsPage";

export const metadata: Metadata = {
  title: "오시는길",
};

export default function Page() {
  return <DirectionsPage />;
}
