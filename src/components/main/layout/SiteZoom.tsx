"use client";

import { usePathname } from "next/navigation";
import { useLayoutEffect } from "react";
import { isMain } from "@/lib/mode";

export function SiteZoom() {
  const pathname = usePathname();

  useLayoutEffect(() => {
    const on = isMain && !pathname.startsWith("/admin");
    document.documentElement.classList.toggle("is-main", on);
  }, [pathname]);

  return null;
}
