"use client";

import { useRef, type ReactNode } from "react";
import { useStickyDock } from "@/lib/sticky-dock";

export function DockNav({ children }: { children: ReactNode }) {
  const slotRef = useRef<HTMLDivElement>(null);
  const dockRef = useRef<HTMLDivElement>(null);
  const stuck = useStickyDock(slotRef, dockRef);

  return (
    <div className="flow__nav-slot" ref={slotRef}>
      <div className={stuck ? "flow__nav is-stuck" : "flow__nav"} ref={dockRef}>
        {children}
      </div>
    </div>
  );
}
