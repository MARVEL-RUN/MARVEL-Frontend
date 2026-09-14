"use client";

import { useEffect } from "react";
import { isMobileView, keyboardCover } from "@/lib/viewport";

const FIELD = "input, textarea, select";

export function KeyboardInset() {
  useEffect(() => {
    const html = document.documentElement;
    let kb = 0;
    let pinTimer = 0;

    const setKb = (next: number) => {
      const rounded = Math.max(0, Math.round(next));
      if (rounded === kb) return;
      if (rounded > 0 && kb > 0 && Math.abs(rounded - kb) < 16) return;
      kb = rounded;
      html.style.setProperty("--kb", `${kb}px`);
    };

    const measure = () => {
      setKb(isMobileView() ? keyboardCover() : 0);
    };

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

    const onFocusIn = (e: FocusEvent) => {
      if (!(e.target instanceof HTMLElement) || !e.target.matches(FIELD)) return;
      measure();
      window.clearTimeout(pinTimer);
      pinTimer = window.setTimeout(() => {
        measure();
        pinField();
      }, 350);
    };

    const onFocusOut = () => {
      window.setTimeout(() => {
        const el = document.activeElement;
        if (el instanceof HTMLElement && el.matches(FIELD)) return;
        window.clearTimeout(pinTimer);
        setKb(0);
      }, 50);
    };

    const onResize = () => {
      const el = document.activeElement;
      if (el instanceof HTMLElement && el.matches(FIELD)) measure();
      else if (!isMobileView()) setKb(0);
    };

    measure();
    window.addEventListener("resize", onResize);
    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("focusout", onFocusOut);
    const vv = window.visualViewport;
    vv?.addEventListener("resize", onResize);
    return () => {
      window.clearTimeout(pinTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);
      vv?.removeEventListener("resize", onResize);
      html.style.setProperty("--kb", "0px");
    };
  }, []);

  return null;
}
