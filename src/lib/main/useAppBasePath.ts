"use client";

import { usePathname } from "next/navigation";
import { appBaseFromPath, withAppBase } from "@/lib/preview";

/** 미리보기 경로에 있으면 base, 아니면 "". 기존 URL 동작은 그대로 */
export function useAppBasePath() {
  return appBaseFromPath(usePathname() ?? "");
}

export function useAppHref(path: string) {
  return withAppBase(useAppBasePath(), path);
}
