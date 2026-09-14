"use client";

import { useEffect } from "react";
import { isMobileView, keyboardCover } from "@/lib/viewport";

const FIELD = "input, textarea, select";

function viewportMeta() {
  return document.querySelector('meta[name="viewport"]');
}

function setScaleLock(lock: boolean) {
  const meta = viewportMeta();
  if (!(meta instanceof HTMLMetaElement)) return;
  const parts = meta.content
    .split(",")
    .map((part) => part.trim())
    .filter(
      (part) =>
        part &&
        !part.startsWith("maximum-scale") &&
        part !== "user-scalable=no" &&
        part !== "user-scalable=yes",
    );
  if (lock) parts.push("maximum-scale=1");
  meta.content = parts.join(", ");
}

export function KeyboardInset() {
  useEffect(() => {
    const html = document.documentElement;
    let kb = 0;
    let pinTimer = 0;
    let laterTimer = 0;
    let savedY = 0;

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

    const revealIfCovered = () => {
      const el = document.activeElement;
      if (!(el instanceof HTMLElement) || !el.matches(FIELD)) return;
      const vv = window.visualViewport;
      if (!vv) return;
      const dock = document.querySelector(
        ".flow__nav.is-stuck, .apply-terms__actions.is-stuck",
      );
      const dockH =
        dock instanceof HTMLElement ? dock.getBoundingClientRect().height : 0;
      const bottom = vv.offsetTop + vv.height - dockH - 12;
      const r = el.getBoundingClientRect();
      if (r.bottom <= bottom) return;
      window.scrollBy(0, r.bottom - bottom);
    };

    const keepPlace = () => {
      if (Math.abs(window.scrollY - savedY) > 1) {
        window.scrollTo(0, savedY);
      }
      measure();
      revealIfCovered();
    };

    const onFocusIn = (e: FocusEvent) => {
      if (!(e.target instanceof HTMLElement) || !e.target.matches(FIELD)) return;
      if (!isMobileView()) return;
      savedY = window.scrollY;
      html.classList.add("is-typing");
      setScaleLock(true);
      measure();
      window.clearTimeout(pinTimer);
      window.clearTimeout(laterTimer);
      pinTimer = window.setTimeout(keepPlace, 50);
      laterTimer = window.setTimeout(keepPlace, 350);
    };

    const onFocusOut = () => {
      window.setTimeout(() => {
        const el = document.activeElement;
        if (el instanceof HTMLElement && el.matches(FIELD)) return;
        window.clearTimeout(pinTimer);
        window.clearTimeout(laterTimer);
        html.classList.remove("is-typing");
        setKb(0);
        setScaleLock(false);
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
      window.clearTimeout(laterTimer);
      window.removeEventListener("resize", onResize);
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);
      vv?.removeEventListener("resize", onResize);
      html.classList.remove("is-typing");
      html.style.setProperty("--kb", "0px");
      setScaleLock(false);
    };
  }, []);

  return null;
}
