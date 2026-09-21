"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { isMain } from "@/lib/mode";
import { isPreviewPath } from "@/lib/preview";

export function SiteZoom() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const on =
      (isMain || isPreviewPath(pathname)) && !pathname.startsWith("/admin");
    document.documentElement.classList.toggle("is-main", on);
  }, [pathname]);

  return null;
}
