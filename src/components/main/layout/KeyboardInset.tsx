"use client";

import { useEffect } from "react";
import { isMobileView, keyboardCover } from "@/lib/viewport";

const FIELD = "input, textarea, select";

export function KeyboardInset() {
  useEffect(() => {
    const html = document.documentElement;

    const pinField = () => {
      const el = document.activeElement;
      if (!(el instanceof HTMLElement) || !el.matches(FIELD)) return;
      const vv = window.visualViewport;
      if (!vv) return;
      const dock = document.querySelector(
        ".flow__nav.is-stuck, .apply-terms__actions.is-stuck",
      );
      const dockH =
        dock instanceof HTMLElement ? dock.getBoundingClientRect().height : 0;
      const top = vv.offsetTop + 8;
      const bottom = vv.offsetTop + vv.height - dockH - 12;
      const r = el.getBoundingClientRect();
      if (r.bottom <= bottom && r.top >= top) return;
      window.scrollBy(0, r.bottom > bottom ? r.bottom - bottom : r.top - top);
    };

    const sync = () => {
      html.style.setProperty("--kb", isMobileView() ? `${keyboardCover()}px` : "0px");
      pinField();
    };

    const onFocusIn = (e: FocusEvent) => {
      if (e.target instanceof HTMLElement && e.target.matches(FIELD)) {
        requestAnimationFrame(sync);
      }
    };

    sync();
    window.addEventListener("resize", sync);
    window.addEventListener("focusin", onFocusIn);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", sync);
    vv?.addEventListener("scroll", sync);
    return () => {
      window.removeEventListener("resize", sync);
      window.removeEventListener("focusin", onFocusIn);
      vv?.removeEventListener("resize", sync);
      vv?.removeEventListener("scroll", sync);
      html.style.setProperty("--kb", "0px");
    };
  }, []);

  return null;
}
