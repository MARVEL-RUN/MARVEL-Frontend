"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { isMain } from "@/lib/mode";
import { isPreviewPath } from "@/lib/preview";
import { isVirtualRunAppPath } from "@/lib/virtual-run/href";

export function SiteZoom() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const on =
      (isMain || isPreviewPath(pathname) || isVirtualRunAppPath(pathname)) &&
      !pathname.startsWith("/admin");
    document.documentElement.classList.toggle("is-main", on);
  }, [pathname]);

  return null;
}
