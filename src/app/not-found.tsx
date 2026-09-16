import type { Metadata } from "next";
import { NotFoundPage } from "@/components/main/not-found/NotFoundPage";
import { isComingSoon } from "@/lib/mode";

export const metadata: Metadata = {
  title: "페이지를 찾을 수 없습니다 | MARVEL RUN 2026 KOREA",
};

export default function NotFound() {
  return <NotFoundPage chrome={!isComingSoon} />;
}
