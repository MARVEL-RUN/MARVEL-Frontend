"use client";

import { usePathname } from "next/navigation";
import { useEffect, useState } from "react";
import { appBaseFromPath, isPreviewPath, withAppBase } from "@/lib/preview";

function resolvePath(routePath: string) {
  if (typeof window !== "undefined" && isPreviewPath(window.location.pathname)) {
    return window.location.pathname;
  }
  return routePath;
}

/** 미리보기 경로에 있으면 base, 아니면 "". 기존 URL 동작은 그대로 */
export function useAppBasePath() {
  const routePath = usePathname() ?? "";
  const [path, setPath] = useState(routePath);

  useEffect(() => {
    setPath(resolvePath(routePath));
  }, [routePath]);

  return appBaseFromPath(path);
}

export function useIsPreviewPath() {
  return Boolean(useAppBasePath());
}

export function useAppHref(path: string) {
  return withAppBase(useAppBasePath(), path);
}
