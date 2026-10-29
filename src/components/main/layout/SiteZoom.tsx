"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { isMain } from "@/lib/mode";
import { isPreviewPath } from "@/lib/preview";

export function SiteZoom() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const bare =
      pathname.startsWith("/admin") ||
      pathname === "/info" ||
      pathname.startsWith("/info/");
    const on = (isMain || isPreviewPath(pathname)) && !bare;
    document.documentElement.classList.toggle("is-main", on);
  }, [pathname]);

  return null;
}
