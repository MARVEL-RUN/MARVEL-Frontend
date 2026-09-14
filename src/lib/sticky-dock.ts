"use client";

import { useEffect, useState, type RefObject } from "react";
import { isMobileView, keyboardCover } from "./viewport";

export function useStickyDock(
  slotRef: RefObject<HTMLElement | null>,
  dockRef: RefObject<HTMLElement | null>,
) {
  const [stuck, setStuck] = useState(true);

  useEffect(() => {
    const slot = slotRef.current;
    const dock = dockRef.current;
    if (!slot || !dock) return;

    const sync = () => {
      if (!isMobileView()) {
        setStuck(false);
        return;
      }
      const line = window.innerHeight - dock.offsetHeight - keyboardCover();
      setStuck(slot.getBoundingClientRect().top > line + 0.5);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
    };
  }, [dockRef, slotRef]);

  return stuck;
}
