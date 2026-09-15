"use client";

import { useEffect, useState, type RefObject } from "react";
import { isMobileView, keyboardCover } from "./viewport";

const FIELD = "input, textarea, select";

function typing() {
  const el = document.activeElement;
  return el instanceof HTMLElement && el.matches(FIELD);
}

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
      if (typing()) {
        setStuck(true);
        return;
      }
      const line = window.innerHeight - dock.offsetHeight - keyboardCover();
      setStuck(slot.getBoundingClientRect().top > line + 0.5);
    };

    sync();
    window.addEventListener("scroll", sync, { passive: true });
    window.addEventListener("resize", sync);
    window.addEventListener("focusin", sync);
    window.addEventListener("focusout", sync);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", sync);
    return () => {
      window.removeEventListener("scroll", sync);
      window.removeEventListener("resize", sync);
      window.removeEventListener("focusin", sync);
      window.removeEventListener("focusout", sync);
      vv?.removeEventListener("resize", sync);
    };
  }, [dockRef, slotRef]);

  return stuck;
}
