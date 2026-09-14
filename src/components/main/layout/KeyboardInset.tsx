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

function typing() {
  const el = document.activeElement;
  return el instanceof HTMLElement && el.matches(FIELD);
}

export function KeyboardInset() {
  useEffect(() => {
    const html = document.documentElement;
    let kb = 0;
    let savedY = 0;
    let frozen = false;

    const setKb = (next: number) => {
      const rounded = Math.max(0, Math.round(next));
      if (rounded === kb) return;
      if (rounded > 0 && kb > 0 && Math.abs(rounded - kb) < 16) return;
      kb = rounded;
      html.style.setProperty("--kb", `${kb}px`);
    };

    const freeze = () => {
      if (frozen) return;
      frozen = true;
      savedY = window.scrollY;
      html.classList.add("is-typing");
      html.style.top = `-${savedY}px`;
      setScaleLock(true);
      setKb(isMobileView() ? keyboardCover() : 0);
    };

    const unfreeze = () => {
      if (!frozen) return;
      frozen = false;
      html.classList.remove("is-typing");
      html.style.top = "";
      setKb(0);
      setScaleLock(false);
      window.scrollTo(0, savedY);
    };

    const onFocusIn = (e: FocusEvent) => {
      if (!(e.target instanceof HTMLElement) || !e.target.matches(FIELD)) return;
      if (!isMobileView()) return;
      freeze();
    };

    const onFocusOut = () => {
      window.setTimeout(() => {
        if (typing()) return;
        unfreeze();
      }, 50);
    };

    window.addEventListener("focusin", onFocusIn);
    window.addEventListener("focusout", onFocusOut);
    return () => {
      window.removeEventListener("focusin", onFocusIn);
      window.removeEventListener("focusout", onFocusOut);
      if (frozen) unfreeze();
    };
  }, []);

  return null;
}
